const StatusCodes = require("http-status-codes").StatusCodes;
const ISampler = require( "./ISampler" );
const EventsManager = require("./services/EventsManager");

class Sampler extends ISampler {

    /**
     *
     * @param eventManager {EventsManager}
     */
    constructor(eventManager) {
        super();

        /**
         *
         * @type {AbstractSamplingStrategy}
         */
        this.strategy = null;

        /**
         *
         * @type {SamplingController}
         */
        this.controller = null;

        this.eventManager = eventManager;
    }

    setStrategy( strategy ) {
        this.strategy = strategy;
        this.controller = this.strategy.getController();
    }

    async fetch() {
        let sampleStates = await this.controller.fetch();
        let sample;

        console.log(`[${this.constructor.name}] fetching local samples` );
        for (const tag of sampleStates.paused ) {
            // this sample is a placeholder to be fetched with real one
            sample = this.strategy.create( tag, {});

            try {
                // let sample to fetch
                await sample.fetch();
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error fetching local paused sample", tag, "; reason:", e );
            }
            this.controller.setPaused(tag, sample);
        }

        for (const tag of sampleStates.active) {
            // this sample is a placeholder to be fetched with real one
            sample = this.strategy.create( tag, {});
            try {
                // let sample to fetch
                await sample.fetch();
                this.controller.setActive( tag, sample );
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error fetching local active sample", tag, "; reason:", e );
                this.controller.setPaused( tag, sample );
            }
        }

        return this.strategy.fetch();
    }

    async store() {
        await this.controller.store();
        return await this.strategy.store();
    }

    async start() {
        this.strategy.start();
    }

    getSamplesStates() {
        return new Map([
                [
                    "active",
                    this.controller.getActiveTags()
                ],
                [
                    "paused",
                    this.controller.getPausedTags()
                ]
            ]
        );
    }

    async getSampleItems( tag ) {
        let sample = await this.controller.get( tag );
        let items = sample.getCollection().toArray();
        return items;
    }

    async addSample( tag, rawFilter ) {
        let sample = await this.controller.get( tag );
        if( !sample ) {
            sample = await this.strategy.create( tag, rawFilter );
            try {
               await this.strategy.add( sample );

               try {
                   await this.controller.add( sample );
               }
               catch (e) {
                   return StatusCodes.INTERNAL_SERVER_ERROR;
               }

               return StatusCodes.CREATED;
            }
            catch (result) {
                return result;
            }
        }
        else {
            return StatusCodes.CONFLICT;
        }
    }

    getSample( tag ) {
        return this.controller.get( tag );
    }

    async resumeSample( tag ) {
        let sample = this.controller.getPaused( tag );
        if( sample ) {
            console.log( `[${this.strategy.constructor.name}]`, "Request to resume sample", `"${tag}"` );
            let result = await this.strategy.resume( sample );
            switch( result ) {
                case StatusCodes.OK:
                    this.controller.setActive( tag, sample );
                    break;
                case StatusCodes.CONFLICT:
                case StatusCodes.NOT_ACCEPTABLE:
                default:
                    break
            }
            return result;
        }
        else if( this.controller.activeSamples.has( tag ) ) {
            return StatusCodes.METHOD_NOT_ALLOWED;
        }

        return StatusCodes.NOT_FOUND;
    }

    async pauseSample( tag ) {
        let sample = this.controller.getActive( tag );
        if( sample ) {
            console.log( `[${this.strategy.constructor.name}]`, "Request to pause sample", `"${tag}"` );
            let result = await this.strategy.pause( sample );
            if( result === StatusCodes.OK) {
                this.controller.setPaused(tag, sample);
                sample.store()
                    .catch((e) => console.error(`[${this.constructor.name}]`, "Error while storing sample", `"${tag}"`, e))
            }
            return result;
        }
        else if( this.controller.pausedSamples.has( tag ) ) {
            return StatusCodes.METHOD_NOT_ALLOWED;
        }

        return StatusCodes.NOT_FOUND;
    }

    async deleteSample( tag ) {
        console.log( `[${this.constructor.name}]`, "erasing sample", tag );
        let sample = await this.get( tag );
        try {
            if( sample ) {
                let result = await this.strategy.delete(sample);
                if( result === StatusCodes.OK ) {
                    await sample.erase();
                }
            }

            console.log( `[${this.constructor.name}]`, "Remove sample to paused streams", tag );
        }
        catch ( e ) {
            if( e.code === "ENOENT" ) {
                console.warn(`[${this.constructor.name}]`, "Attempting to remove a not concrete sample", `"${tag}"\n`, "\ndetails:", sample, "\nreason:", e );
            }
            else {
                console.error(`[${this.constructor.name}]`, "Error erasing local sample\n", sample, "\nreason:", e);
            }
        }
    }


}

module.exports = Sampler;