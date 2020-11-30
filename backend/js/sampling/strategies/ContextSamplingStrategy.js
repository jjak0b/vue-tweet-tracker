const StatusCodes = require("http-status-codes").StatusCodes;
const Tweet = require( "../../sampleItems/Tweet" );
const FilterConverter = require( "../../filterConverter");
const SamplingController = require("../controllers/SamplingController");
const ContextSampleBuilder = require("../building/builders/ContextSampleBuilder");
const AbstractSamplingStrategy = require("./AbstractSamplingStrategy");
const BoundingBox = require("boundingbox");
const api = require("../../clients/2.0");
class ContextSamplingStrategy extends AbstractSamplingStrategy {
    static MAX_RESULT_PER_REQUEST = 100;
    static MAX_STREAMS_COUNT = 25;

    /**
     *
     * @param location
     * @param eventsManager {EventsManager}
     */
    constructor(location, eventsManager) {
        super(
            new SamplingController( location ),
            eventsManager
        );

        /**
         *
         * @type {TwitterStream}
         */
       this.stream = null;
       const builder = new ContextSampleBuilder();
       this.sampleDirector.setBuilder( builder );
       this.sampleDirector.setLocation( location );
    }

    async fetch() {

        // fetch remote after
        console.log(`[${this.constructor.name}]`, "Fetching active stream rules ...");
        // this.requestAPI("get", "tweets/search/stream/rules", null, null, true)
        let json;
        try {
            json = await api.clientAppContext.get("tweets/search/stream/rules");
        }
        catch (err) {
            console.error(`[${this.constructor.name}]`, "Error fetching remote samples", "cause:", err);
        }

        if( !json ) return;
        let validRules = [];
        if (Array.isArray(json.data) && json.data.length > 0) {
            console.log(`[${this.constructor.name}]`, "Detected remote samples:", json.data);
            let unhandledRules = [];
            for (const rule of json.data) {
                let sample = await this.controller.getActive( rule.tag );
                if( !sample ) {
                    // this may happen if someone else is using the same key ... so just delete on remote
                    unhandledRules.push( rule );
                    console.error(`[${this.constructor.name}]`, "ERROR ! sample mismatch", rule.tag, "Active sample found on remote but not on local ... removing from remote", rule );
                }
                else {
                    validRules.push( rule );
                    this.start();
                }
            }

            if( unhandledRules.length > 0 ) {
                api.clientAppContext.post(
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
            console.log(`[${this.constructor.name}]`, "No remote active samples detected");
            for (const activeTag of this.getController().getActiveTags() ) {
                if( !validRules.some( (rule) => rule.tag === activeTag ) ) {
                    let sample = this.getController().getActive( activeTag );
                    console.error(`[${this.constructor.name}]`, "ERROR ! sample mismatch", activeTag, "Active sample found on local but not on remote ... pausing" );
                    this.getController().setPaused( activeTag, sample );
                }
            }

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
            let response = await api.clientAppContext.post(
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
                if (response.errors[0].type === 'https://api.twitter.com/2/problems/duplicate-rules' ) {
                    return Promise.reject(StatusCodes.CONFLICT);
                }
                else {
                    return Promise.reject(StatusCodes.NOT_ACCEPTABLE);
                }
            }
        }
        catch(err) {
            console.error(`[${this.constructor.name}]`, "verify addition ->", "error:", JSON.stringify( err) );
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

        console.log( `[${this.constructor.name}]`, "Request of resume sample with tag ", `"${sample.tag}"`);

            let descriptor = sample.getDescriptor()
            /**
             * @type {ContextFilteringRule}
             */
            let rule = descriptor.getRule();
            let filter = rule.filter;
            //stringify filter into query filter
            let queryFilter = ContextSamplingStrategy.getQueryFromFilter( filter );

            console.log(`[${this.constructor.name}]`, "resuming", rule.tag, "active query:", queryFilter );
            let json;
            try {
                json = await api.clientAppContext.post(
                    "tweets/search/stream/rules",
                    {
                        add: [{tag:rule.tag, value:queryFilter}]
                    }
                );
            }
            catch(err) {
                console.error(`[${this.constructor.name}]`, "resume", "error:", err);
                return StatusCodes.INTERNAL_SERVER_ERROR;
            }


            if (json.meta.summary.created) {

                rule.id = json.data[0].id;
                this.start();
                return StatusCodes.OK;
            }
            else if (json.meta.summary.not_created) {
                if( json.errors[0].type === 'https://api.twitter.com/2/problems/duplicate-rules' ) {
                    return StatusCodes.CONFLICT;
                }
                else {
                    console.error(`[${this.constructor.name}]`,"received resume response", json );
                    // should be set StatusCodes.TOO_MANY_REQUESTS here ?
                    return StatusCodes.BAD_GATEWAY;
                }
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
                        this.stop();
                    }
                }
                else {
                    console.warn(`[${this.constructor.name}]`, "stream stopped manually");
                }
            }
        }while( retry );
    }

    // https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
    async streamConnect( handlers ) {
        //Listen to the stream

        try {
            console.log(`[${this.constructor.name}]`, "Connecting stream ...");
            this.stream = await api.getStream();
        }
        catch (e) {
            console.error(`[${this.constructor.name}]`, "Unable to establish connection stream ..." );
            return Promise.reject( e );
        }

            console.log(`[${this.constructor.name}]`, "Listening for stream ...");
            for await (const response of this.stream) {
                // console.log( response);
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
        let possibleTweet = Tweet.toArrayFromResponse({
            data: [ response.data ],
            includes: response.includes
        });

        if( possibleTweet && possibleTweet.length > 0 ) {
            this.routesDataToSamples(possibleTweet[0], destinations);
        }
        else {
            try {
                console.error(`[${this.constructor.name}]`, "Invalid data received:\n", response );
            }
            catch (e) {
                console.error(`[${this.constructor.name}]`, "Invalid data receved that caused error:\n", e );
            }
        }
    }

    async routesDataToSamples( tweet, destinationRules) {
        for (let i = 0; i < destinationRules.length; i++) {
            let tag = destinationRules[ i ].tag;
            let sample = this.getController().get(tag);
            if (sample) {
                if( this.checkPostGeoFilter(sample, tweet ) ) {
                    try {
                        await this.addItem(sample, tweet);
                    }
                    catch (e) {
                        console.error(`[${this.constructor.name}:routesDataToSamples]`, `Unable to add Item to "${tag}" sample collection`, "reason", e);
                    }
                }
            }
            else {
                // ley us know if something doesn't behave like it should
                console.warn(`[${this.constructor.name}:routesDataToSamples]`, `Unable to find route for "${tag}" sample`, "So the data has been ignores");
            }
        }
    }

    /**
     *
     * @param sample {Sample}
     * @param item {Tweet}
     */
    checkPostGeoFilter(sample, item ) {
        let descriptor = sample.getDescriptor();
        let rule = descriptor.getRule();
        let filter = rule.getFilter();

        function getBBoxFromRectangle( rectangle ) {
            return new BoundingBox({
                minlon: Math.min( rectangle[0][0], rectangle[1][0] ),
                maxlon: Math.max( rectangle[0][0], rectangle[1][0] ),
                minlat: Math.min( rectangle[0][1], rectangle[1][1] ),
                maxlat: Math.max( rectangle[0][1], rectangle[1][1] )
            });
        }
        /**
         * @type BoundingBox[]
         */
        let bBoxes = filter.locations.map( (rectangle) => getBBoxFromRectangle( rectangle ) );

        let isMatching = true;
        if( bBoxes.length > 0 ) {
            if( item.data.geo && item.data.geo.coordinates ) {
                let itemBbox = new BoundingBox( {
                    lon: item.data.geo.coordinates[0],
                    lat: item.data.geo.coordinates[1]
                });

                isMatching = bBoxes.some( (bBox) => itemBbox.within( bBox ) );
            }
            else if( item.places && item.places.geo && item.places.geo ) {
                if( item.places.geo.type === "Feature" ) {
                    let rectangle = item.places.geo.bbox;
                    let itemBBox = getBBoxFromRectangle([
                        [
                            rectangle[0],
                            rectangle[1]
                        ],
                        [
                            rectangle[2],
                            rectangle[3]
                        ]
                    ]);
                    isMatching = bBoxes.some( (bBox) => itemBBox.intersects( bBox ) || itemBBox.within( bBox ) );
                }
                else {
                    isMatching = false;
                    console.error(`[${this.constructor.name}]`, `IMPORTANT Found unsupported geo type "${item.places.geo.type}" in sample "${descriptor.tag}:\n`, item );
                }
            }
            else {
                isMatching = false;
            }
        }

        return isMatching;
    }

    async stop() {
        if( this.stream ) {
            console.log(`[${this.constructor.name}]`, "stopping stream");
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
            if( !rule.id ) {
                return StatusCodes.METHOD_NOT_ALLOWED;
            }
            let response;
            try {
                response = await api.clientAppContext.post(
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
                if( err.details === 'https://api.twitter.com/2/problems/invalid-request') {
                    return StatusCodes.BAD_GATEWAY;
                }
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