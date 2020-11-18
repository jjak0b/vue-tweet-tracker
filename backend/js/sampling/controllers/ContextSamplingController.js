const Twitter = require("twitter-v2");
const StatusCodes = require("http-status-codes").StatusCodes;
const Tweet = require( "../../sampleItems/Tweet" );
const FilterConverter = require( "../../filterConverter");
const SamplingController = require("./SamplingController");
const EventsManager = require("../services/EventsManager");
const ContextSampleBuilder = require("../building/builders/ContextSampleBuilder");
const FSResourceStorage = require("../../FSResourceStorage");
const SampledEvent = require("../events/SampledEvent");

const userContextClient = new Twitter( {
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_API_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET,
});

const appContextClient = new Twitter( {
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET
});

class ContextSamplingController extends SamplingController {
    static MAX_RESULT_PER_REQUEST = 100;
    static MAX_STREAMS_COUNT = 25;

    static ENUM = {
        SEARCH: {
            RECENT: {
                API: "https://api.twitter.com/2/tweets/search/recent"
                // API: "https://api.twitter.com/1.1/search/tweets.json" // 1.1
            },
            STREAM: {
                API: "https://api.twitter.com/2/tweets/search/stream",
                RULES: {
                    API: "https://api.twitter.com/2/tweets/search/stream/rules"
                }
            }
        }
    };

    static PARAMETERS = {
        expansions: [
            "author_id",
            "geo.place_id",
        ].join(),
        "tweet.fields": [
            "geo",
            "public_metrics",
            "lang",
            "text",
            "possibly_sensitive",
            "context_annotations",
            "entities"
        ].join(),
        "place.fields": [
            "id",
            "geo",
            "place_type", /* city | poi */
            "full_name",
            "country_code",
            "country",
            "contained_within"
        ].join(),
        "user.fields": [
            "name",
            "location",
            "created_at"
        ].join()
    };

    constructor(eventManager, workingDirectory) {
        super(eventManager, workingDirectory);
        this.samplesStates.setStorage( FSResourceStorage.getInstance() );

        /**
         *
         * @type {TwitterStream}
         */
       this.stream = null;

       const builder = new ContextSampleBuilder( workingDirectory );
       this.sampleDirector.setBuilder( builder );

        this.fetch()
            .finally( () => {
                if( this.getActiveTags().length > 0 )
                    this.start();
            });
    }

    async fetch() {
        // fetch local first
        await super.fetch();

        // fetch remote after
        console.log("[ContextSamplingController", "Fetching active stream rules ...");
        // this.requestAPI("get", "tweets/search/stream/rules", null, null, true)
        let json;
        try {
            json = await appContextClient.get("tweets/search/stream/rules");
        }
        catch (err) {
            console.error("[ContextSamplingController", "Error fetching remote samples", "cause:", err);
        }

        if( !json ) return;

        if (Array.isArray(json.data) && json.data.length > 0) {
            console.log("[ContextSamplingController", "Detected remote samples:", json.data);
            let unhandledRules = [];
            for (const rule of json.data) {
                let sample = await this.get( rule.tag );
                if( !sample ) {
                    // this may happen if someone else is using the same key ... so just delete on remote
                    unhandledRules.push( rule );
                    console.error("[ContextSamplingController", "ERROR ! sample mismatch", rule.tag, "Active sample found on remote but not on local ... removing", unhandledRules );
                }
                else {
                    super.resume( rule.tag );
                }
            }

            if( unhandledRules.length > 0 ) {
                appContextClient.post(
                    "tweets/search/stream/rules",
                    {
                        delete: {
                            ids: unhandledRules.map((rule) => rule.id)
                        }
                    }
                )
                    .catch(e => console.error("[ContextSamplingController", "Error deleting mismatching rules", e));
            }

        }
        else {
            console.log("[ContextSamplingController", "No active samples detected");
        }
    }

    static getQueryFromFilter( filter ) {
        return FilterConverter.convertfilter( filter );
    }

    async remove(tag ) {
        const handleDeleteSample = (statusCode) => {
            switch( statusCode ) {
                case StatusCodes.OK:
                case StatusCodes.METHOD_NOT_ALLOWED: {
                    super.remove( tag );
                    super.store();
                    return Promise.resolve(StatusCodes.OK);
                }
                default:
                    return Promise.reject( statusCode );
            }
        }

        try {
            return handleDeleteSample( await this.pause(tag) );
        }
        catch (e) {
            return handleDeleteSample( e );
        }
    }

    async add(tag, filter ) {
        let sample = await this.get( tag );
        if( !sample ) {
            try {
                await super.add( tag, filter );
                return Promise.resolve( StatusCodes.CREATED );
            }
            catch (e) {
                return Promise.reject( StatusCodes.INTERNAL_SERVER_ERROR );
            }

        }
        else {
            return Promise.reject( StatusCodes.CONFLICT )
        }
    }

    async resume(tag ) {

        console.log( "[ContextSamplingController]", "Request of resume sample with tag ", `"${tag}"`);

        if( this.activeSamples.size >= ContextSamplingController.MAX_STREAMS_COUNT ) {
            return Promise.reject( StatusCodes.TOO_MANY_REQUESTS );
        }

        let sample = this.pausedSamples.get( tag );

        if( sample ) {

            let descriptor = sample.getDescriptor()
            let rule = descriptor.getRule();
            let filter = rule.filter;
            //stringify filter into query filter
            let queryFilter = ContextSamplingController.getQueryFromFilter( filter );

            console.log("resuming", sample, "active query:", filter, "; result:", queryFilter );
            let json;
            try {
                json = await appContextClient.post(
                    "tweets/search/stream/rules",
                    {
                        add: [{tag:rule.tag, value:queryFilter}]
                    }
                );
            }
            catch(err) {
                console.error("[ContextSamplingController]", "resume", "error:", err);
                return Promise.reject( StatusCodes.INTERNAL_SERVER_ERROR );
            }

            console.log("resume response", json);
            // even if responds CREATED, the response content can contains errors
            if (json.meta.summary.valid) {
                if (json.meta.summary.created) {

                    /** @type {ContextFilteringRule}*/
                    rule.id = json.data[0].id;
                    await super.resume( tag );

                    // start sampling if needed
                    this.start();

                    return StatusCodes.OK;
                }
                else if (json.meta.summary.not_created) {
                    return Promise.reject( StatusCodes.BAD_GATEWAY );
                }
            }
            else {
                this.pausedSamples.delete( tag );
                super.store();

                if (json.errors[0].title === "DuplicateRule") {
                    return Promise.reject(StatusCodes.CONFLICT);
                }
                else {
                    return Promise.reject(StatusCodes.NOT_ACCEPTABLE);
                }
            }
        }
        else if( this.activeSamples.has( tag ) ) {
            return Promise.reject( StatusCodes.METHOD_NOT_ALLOWED );
        }

        return Promise.reject( StatusCodes.NOT_FOUND );
    }

    async start() {
        if( this.stream ) return;

        let timeout = 0;
        let handlers = {
            // will be popolated below, justy here to reference "reconnect" function
        };


        let self = this;
        function timeoutHandler() {
            // Reconnect on error
            console.warn('A connection error occurred. Reconnecting…');
            setTimeout(
                () => { timeout++; self.streamConnect( handlers ); },
                2 ** timeout
            );
            self.streamConnect( handlers );
        }

        handlers.timeout = timeoutHandler;
        handlers.error = console.error;
        handlers.response = this.onStreamDataReceived.bind( self );
        let reason = await this.streamConnect( handlers );
        console.warn( "[ContextSamplingController]", "stream stopped, reason", reason );

        return reason;
    }

    // https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
    async streamConnect( handlers ) {
        //Listen to the stream
        let params = ContextSamplingController.PARAMETERS;


        try {
            console.log("Connecting stream ...");
            this.stream = appContextClient.stream('tweets/search/stream', params );
        }
        catch (e) {
            console.log("Unable to establish connection stream ..." );
            return e;
        }

        try{
            console.log("Listening for stream ...");
            for await (const response of this.stream) {
                let errors = response.errors;

                if( errors ) {
                    if ("error" in handlers)
                        handlers["error"](errors);
                }

                if( response.data && response.data.id ) {
                    if( "response" in handlers )
                        handlers[ "response" ]( response );
                }
            }
            return null;
        }
        catch (e) {
            if ("error" in handlers)
                handlers["error"](e);
            return e;
        }
    }

    onStreamDataReceived( response ) {
        let destinations = response.matching_rules;
        response.matching_rules = null;
        this.routesDataToSamples(response, destinations );
    }

    async routesDataToSamples( dataToAssign, destinationRules) {
        for (let i = 0; i < destinationRules.length; i++) {
            let tweet = new Tweet( dataToAssign );
            let tag = destinationRules[ i ].tag;
            let sample = await this.get( tag );
            if( sample ) {
                sample.add( tweet )
                    .catch( (e) => {
                        console.error( "[ContextSamplingController:routesDataToSamples]", `Unable to add item to "${tag}" sample`, "reason:", e );
                    });
                let descriptor = sample.getDescriptor();
                descriptor.incCount();
                let event = new SampledEvent( descriptor, tweet );
                this.eventManager.emit( EventsManager.ENUM.EVENTS.SAMPLED, event );
            }
            else {
                // ley us know if something doesn't behave like it should
                console.error( "[ContextSamplingController:routesDataToSamples]", `Unable to find route for "${tag}" sample in active samples`, "So the data has been ignores");
            }
        }
    }

    async stop() {
        if( this.stream ) {
            this.stream.close();
            this.stream = null;
            return await super.stop()
        }
        else {
            return Promise.reject();
        }
    }

    async pause(tag ) {
        console.log( "[ContextSamplingController]", "Request of pause sample with tag ", `"${tag}"`);
        let sample = this.activeSamples.get( tag );
        if( sample ) {
            console.log("pausing", sample);

            let descriptor = sample.getDescriptor()
            /** @type {ContextFilteringRule}*/
            let rule = descriptor.getRule();
            let json;
            try {
                json = await appContextClient.post(
                    "tweets/search/stream/rules",
                    {
                        delete: {
                            ids: [rule.id]
                        }
                    }
                );
            }
            catch(err) {
                console.error("[ContextSamplingController]", "pause", "error:", err);
                return Promise.reject(StatusCodes.INTERNAL_SERVER_ERROR);
            }

            console.log("pause response", json);
            if (json.meta.summary.deleted) {
                sample.id = null;
                super.pause( tag );

                if( this.getActiveTags().length < 1 ) {
                    this.stop();
                }

                return Promise.resolve(StatusCodes.OK);
            }
            else {
                /*
                    For some reason the sample can't be delete
                */
                /*
                    this shouldn't never happen because the sample was in active stream
                    but if we are here is because the sample was already been delete from API
                    or the sample id doesn't match with remote API ID
                 */
                return Promise.reject(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
        else if( this.pausedSamples.has( tag ) ) {
            return Promise.reject( StatusCodes.METHOD_NOT_ALLOWED );
        }

        return Promise.reject( StatusCodes.NOT_FOUND );
    }
}

module.exports = ContextSamplingController