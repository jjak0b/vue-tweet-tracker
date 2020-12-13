const StatusCodes =require( "http-status-codes" ).StatusCodes;
const GeocodedFilter = require("../building/parts/filters/GeocodedFilter");
// const FSResourceStorage = require("../../FSResourceStorage");
// const JSONBufferedItemsCollection = require("../../JSONBufferedItemsCollection");
// const path = require("path");
const AbstractSamplingStrategy = require("./AbstractSamplingStrategy");
const SamplingController = require("../controllers/SamplingController");
const GeoSampleBuilder = require("../building/builders/GeoSampleBuilder");
const client = require("../../clients/1.1").clientAppContext;

class GeoSamplingStrategy extends AbstractSamplingStrategy {
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
         * @type {Stream}
         */
        this.stream = null;
        const builder = new GeoSampleBuilder();
        this.sampleDirector.setBuilder( builder );
        this.sampleDirector.setLocation( location );

        this.parameters = {};
        /**
         *
         * @type {Sample}
         */
        this.currentSample = null;
    }


    create(tag, filter) {
        return super.create(tag, filter);
    }

    async delete(sample) {
        super.delete(sample);
    }

    async fetch() {
        console.log(`[${this.constructor.name}]`, "Fetching active stream rules ...");
        for (const activeTag of this.getController().getActiveTags() ) {
            console.log(`[${this.constructor.name}]`, "starting active sample", activeTag );
            let sample = this.getController().getActive( activeTag );
            let result = await this.resume( sample );
            if( result !== StatusCodes.OK ) {
                console.log(`[${this.constructor.name}]`, "Unable to start -> pausing", activeTag );
                this.getController().setPaused( activeTag, sample );
            }
        }
    }

    async start() {
        if( this.stream ) return;

        let handlers = {
            // will be popolated below, justy here to reference "reconnect" function
        };


        let attempts = 0;
        async function wait( time ) {
            return new Promise( (resolve) => {
                setTimeout( () => resolve(), time );
            });
        }

        async function waitTimeout() {
            let waitTime = 2 ** attempts;
            await wait( waitTime );
            attempts++;
            return 2 * waitTime;
        }
        let retry;
        let predictWaitTime = 1;

        handlers.start = async () => {
            console.log(`[${this.constructor.name}]`, "Listening for stream ...");
        };
        handlers.timeout = waitTimeout;

        // handlers.response = (item) => {};
        console.log(`[${this.constructor.name}]`, "End of stream ...", response);
        this.stream                 .on("ping", () =>
            console.log(`[${this.constructor.name}]`, "ping detected")
        )

        do {
            retry = false;
            try {
                // let response;
                await this.streamConnect( handlers );
                this.stream
                .on("data", async (item) => {
                    console.error(`[${this.constructor.name}]`, "received data", item);
                    if (this.currentSample) {
                        this.addItem(this.currentSample, item);
                    }
                    else {
                        console.warn(`[${this.constructor.name}]`, `Unable to find sample to add received item`, "So the data has been ignores");
                    }
                })
                .on("error", async (reason) => {
                    console.error(`[${this.constructor.name}]`, 'A connection error occurred', JSON.stringify( reason ) );
                    if ('errors' in reason) {
                        // Twitter API error
                        if (reason.errors[0].code === 88) {
                            // rate limit exceeded
                            predictWaitTime = new Date(reason._headers.get("x-rate-limit-reset") * 1000);
                            console.warn(`[${this.constructor.name}]`, "rate limit exceeded" );
                            console.warn(`[${this.constructor.name}]`, 'Rate limit will reset on', predictWaitTime, "ms"  );
                            await this.stop();
                            retry = true;
                        }
                        else {
                            // some other kind of error, e.g. read-only API trying to POST
                        }
                    }
                    else {
                        if( reason.code === 'ENOTFOUND' ) {
                            console.warn(`[${this.constructor.name}]`, 'try reconnecting in', predictWaitTime, "ms", reason.message );
                            predictWaitTime = await handlers.timeout(attempts);
                            retry = true;
                            await handlers.timeout();
                        }
                        console.error(`[${this.constructor.name}]`, "stream stopped: ",`\n[msg]>"${reason.message}"`,"\n[err]>", reason );
                        process.nextTick(() => this.stop() );
                        // non-API error, e.g. network problem or invalid JSON in response
                    }
                })
                // .on("timeout", async (response) => {})
            }
            catch (reason) {
                console.error(`[${this.constructor.name}]`, 'connection stopped, A connection error occurred',reason);
                if( predictWaitTime > 0 )
                    await wait( predictWaitTime );
                predictWaitTime = 0;
            }

        }while( retry );
    }

    async streamConnect( handlers ) {
        if( this.stream )
            return ;

        //Listen to the stream
        console.log(`[${this.constructor.name}]`, "Connecting stream ...");
        return new Promise( (resolve, reject) => {
            try {
                this.stream = client.stream("statuses/filter", this.parameters);
                this.stream
                    .on("start", response => {
                        handlers.start();
                        resolve(response)
                    })
                    .on("end", response => reject(response) );
            }
            catch (e) {
                console.error(`[${this.constructor.name}]`, "Unable to establish connection stream ..." );
                return Promise.reject( e );
            }
        });
    }

    async stop() {
        if( this.stream ) {
            this.stream.destroy();
            this.stream = null;
        }
        return await super.stop();
    }

    async add( /*String*/tag, filter ) {
        if( filter ) {
            if( filter.coordinates && filter.coordinates.length > 0 && filter.coordinates.length % 4 === 0 ) {
                await super.add( tag, filter );
                return StatusCodes.OK;
            }
        }
        return StatusCodes.NOT_ACCEPTABLE;
    }

    async resume( sample) {
        if( this.currentSample ) {
            return StatusCodes.TOO_MANY_REQUESTS;
        }

        this.currentSample = sample;
        let descriptor = sample.getDescriptor();
        let rule = descriptor.getRule();
        let filter = rule.getFilter();
        this.parameters = GeoSamplingStrategy.getQueryFromFilter( filter );

        try {
            await this.start();
            return StatusCodes.OK;
        }
        catch (e) {
            return StatusCodes.INTERNAL_SERVER_ERROR;
        }
    }

    async pause( sample ) {
        if( this.currentSample ) {
            try {
                await this.stop();
            }
            catch (e) {
                console.error(`[${this.constructor.name}]`, "Error pausing sample", sample.tag, "reason", e );
                // return StatusCodes.INTERNAL_SERVER_ERROR;
            }
            this.currentSample = null;
            return StatusCodes.OK;
        }
        else {
            return StatusCodes.METHOD_NOT_ALLOWED;
        }
    }

    /**
     *
     * @param filter {GeocodedFilter}
     */
    static getQueryFromFilter( filter ) {
        let query = {
            locations: [],
        };

        if( filter.coordinates.length > 0 ) {
            for (const boundingBox of filter.coordinates) {
                // boundingBox[ 0 ] // longitude
                // boundingBox[ 1 ] // latitude
                query.locations.push( boundingBox.join(",") );
            }
            query.locations = query.locations.join(",");
        }
        return query;
    }
}
/*


const parameters = {
  track: "#Amazon,Amazon",

};*/



async function test() {


}

test();

// To stop the stream:
// process.nextTick(() => stream.destroy());  // emits "end" and "error" events

module.exports = GeoSamplingStrategy;