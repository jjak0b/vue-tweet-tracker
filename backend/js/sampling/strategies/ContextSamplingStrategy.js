const Twitter = require("twitter-v2");
const StatusCodes = require("http-status-codes").StatusCodes;
const Tweet = require( "../../sampleItems/Tweet" );
const FilterConverter = require( "../../filterConverter");
const SamplingController = require("../controllers/SamplingController");
const ContextSampleBuilder = require("../building/builders/ContextSampleBuilder");
const AbstractSamplingStrategy = require("./AbstractSamplingStrategy");

const appContextClient = new Twitter( {
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET
});

class ContextSamplingStrategy extends AbstractSamplingStrategy {
    static MAX_RESULT_PER_REQUEST = 100;
    static MAX_STREAMS_COUNT = 25;

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

    /**
     *
     * @param controller {SamplingController}
     * @param eventsManager {EventsManager}
     */
    constructor(controller, eventsManager) {
        super(controller, eventsManager);

        /**
         *
         * @type {TwitterStream}
         */
       this.stream = null;

       const builder = new ContextSampleBuilder();
       this.sampleDirector.setBuilder( builder );
    }

    async fetch() {

        // fetch remote after
        console.log(`[${this.constructor.name}]`, "Fetching active stream rules ...");
        // this.requestAPI("get", "tweets/search/stream/rules", null, null, true)
        let json;
        try {
            json = await appContextClient.get("tweets/search/stream/rules");
        }
        catch (err) {
            console.error(`[${this.constructor.name}]`, "Error fetching remote samples", "cause:", err);
        }

        if( !json ) return;

        if (Array.isArray(json.data) && json.data.length > 0) {
            console.log(`[${this.constructor.name}]`, "Detected remote samples:", json.data);
            let unhandledRules = [];
            for (const rule of json.data) {
                let sample = await this.controller.get( rule.tag );
                if( !sample ) {
                    // this may happen if someone else is using the same key ... so just delete on remote
                    unhandledRules.push( rule );
                    console.error(`[${this.constructor.name}]`, "ERROR ! sample mismatch", rule.tag, "Active sample found on remote but not on local ... removing", unhandledRules );
                }
                else {
                    this.start();
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
                    .catch(e => console.error(`[${this.constructor.name}]`, "Error deleting mismatching rules", e));
            }

        }
        else {
            console.log(`[${this.constructor.name}]`, "No active samples detected");
        }
    }

    static getQueryFromFilter( filter ) {
        return FilterConverter.convertfilter( filter );
    }

    /**
     *
     * @param sample
     * @return {Promise<StatusCodes.OK | StatusCodes.CONFLICT | StatusCodes.NOT_ACCEPTABLE | StatusCodes.INTERNAL_SERVER_ERROR>}
     */
    async add( sample ) {
        let descriptor = sample.getDescriptor()
        /**
         * @type {ContextFilteringRule}
         */
        let rule = descriptor.getRule();
        let filter = rule.filter;
        //stringify filter into query filter
        let queryFilter = ContextSamplingStrategy.getQueryFromFilter( filter );

        try {
            let response = await appContextClient.post(
                "tweets/search/stream/rules",
                {
                    add: [{tag:sample.tag, value:queryFilter}]
                },
                {
                    dry_run: true // test rule validity
                }
            );

            if( response.meta.summary.valid ) {
                return Promise.resolve( StatusCodes.OK );
            }
            else {
                if (response.errors[0].title === "DuplicateRule") {
                    return Promise.reject(StatusCodes.CONFLICT);
                }
                else {
                    return Promise.reject(StatusCodes.NOT_ACCEPTABLE);
                }
            }
        }
        catch(err) {
            console.error(`[${this.constructor.name}]`, "verify addition ->", "error:", err);
            return Promise.reject( StatusCodes.INTERNAL_SERVER_ERROR );
        }
    }

    /**
     *
     * @param sample
     * @return {Promise<Promise<StatusCodes.OK | number> | Promise<never>>}
     */
    async delete( sample ) {
        const handleDeleteSample = async (statusCode) => {
            switch( statusCode ) {
                case StatusCodes.OK:
                case StatusCodes.METHOD_NOT_ALLOWED: {
                    super.delete( sample );
                    return StatusCodes.OK;
                }
                default:
                    return statusCode;
            }
        }

        return handleDeleteSample( await this.pause( sample ) );
    }


    /**
     *
     * @param sample {Sample}
     * @return {Promise<StatusCodes.OK>}
     */
    async resume( sample ) {

        console.log( "[ContextSamplingStrategy]", "Request of resume sample with tag ", `"${tag}"`);

            let descriptor = sample.getDescriptor()
            /**
             * @type {ContextFilteringRule}
             */
            let rule = descriptor.getRule();
            let filter = rule.filter;
            //stringify filter into query filter
            let queryFilter = ContextSamplingStrategy.getQueryFromFilter( filter );

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
                console.error("[ContextSamplingStrategy]", "resume", "error:", err);
                return StatusCodes.INTERNAL_SERVER_ERROR;
            }

            console.log("resume response", json);

            if (json.meta.summary.created) {

                rule.id = json.data[0].id;

                return StatusCodes.OK;
            }
            else if (json.meta.summary.not_created) {
                // should be set StatusCodes.TOO_MANY_REQUESTS here ?
                return StatusCodes.BAD_GATEWAY;
            }
    }

    async start() {
        if( this.stream ) return;

        let handlers = {
            // will be popolated below, justy here to reference "reconnect" function
        };
        let self = this;

        let attempts = 0;
        async function waitTimeout() {
            let waitTime = 2 ** attempts;
            return new Promise( (resolve) => {
                setTimeout( () => { attempts++; resolve( 2 * waitTime ) }, waitTime );
            });
        }

        handlers.timeout = waitTimeout;
        handlers.error = (e) => console.warn( `[${this.constructor.name}]`, "catched error", e );
        handlers.response = this.onStreamDataReceived.bind( self );
        let retry;
        let predictWaitTime = 1;
        do {
            retry = false;
            try {
                await this.streamConnect( handlers );
            }
            catch (reason) {
                if( reason ) {
                    console.error(`[${this.constructor.name}]`, 'A connection error occurred', JSON.stringify( reason ) );
                    if (
                        reason.message === "Rate limit exceeded"
                        || reason.details === 'https://api.twitter.com/2/problems/streaming-connection'
                        || reason.code === 'ENOTFOUND'
                    ) {
                        console.warn(`[${this.constructor.name}]`, 'try reconnecting in', predictWaitTime, "ms", reason.message );
                        predictWaitTime = await handlers.timeout(attempts);
                        retry = true;
                    }
                    else {
                        console.error(`[${this.constructor.name}]`, "stream stopped: ",`\n[msg]>"${reason.message}"`,"\n[err]>", reason );
                        this.stream.close();
                        this.stream = null;
                    }
                }
            }
        }while( retry );
    }

    // https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
    async streamConnect( handlers ) {
        //Listen to the stream
        let params = ContextSamplingStrategy.PARAMETERS;


        try {
            console.log(`[${this.constructor.name}]`, "Connecting stream ...");
            this.stream = appContextClient.stream('tweets/search/stream', params );
        }
        catch (e) {
            console.error(`[${this.constructor.name}]`, "Unable to establish connection stream ..." );
            return Promise.reject( e );
        }

            console.log(`[${this.constructor.name}]`, "Listening for stream ...");
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

    onStreamDataReceived( response ) {
        let destinations = response.matching_rules;
        response.matching_rules = null;
        this.routesDataToSamples(response, destinations );
    }

    async routesDataToSamples( dataToAssign, destinationRules) {
        for (let i = 0; i < destinationRules.length; i++) {
            let tweet = new Tweet( dataToAssign );
            let tag = destinationRules[ i ].tag;
            let sample = this.getController().get(tag);
            if (sample) {
                try {
                    await this.addItem(sample, tweet);
                }
                catch (e) {
                    console.error(`[${this.constructor.name}:routesDataToSamples]`, `Unable to add Item to "${tag}" sample collection`, "reason", e);
                }
            }
            else {
                // ley us know if something doesn't behave like it should
                console.warn(`[${this.constructor.name}:routesDataToSamples]`, `Unable to find route for "${tag}" sample`, "So the data has been ignores");
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

    async pause( sample ) {
            let descriptor = sample.getDescriptor()
            /** @type {ContextFilteringRule}*/
            let rule = descriptor.getRule();
            let response;
            try {
                response = await appContextClient.post(
                    "tweets/search/stream/rules",
                    {
                        delete: {
                            ids: [rule.id]
                        }
                    }
                );
            }
            catch(err) {
                console.error("[ContextSamplingStrategy]", "pause", "error:", err);
                return StatusCodes.INTERNAL_SERVER_ERROR;
            }

            if (response.meta.summary.deleted) {
                rule.id = null;
                return StatusCodes.OK;
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
                return StatusCodes.INTERNAL_SERVER_ERROR;
            }
    }
}

module.exports = ContextSamplingStrategy