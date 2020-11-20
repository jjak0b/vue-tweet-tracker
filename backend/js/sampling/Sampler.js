const StatusCodes = require("http-status-codes").StatusCodes;
const SampledEvent = require("./events/SampledEvent");
const EventsManager = require( "./services/EventsManager");
const ISampler = require( "./ISampler" );

class Sampler extends ISampler {

    constructor(/*EventsManager*/ eventManager) {
        super();
        /**
         *
         * @type {AbstractSamplingStrategy}
         */
        this.strategy = null;

        /**
         *
         * @type {EventsManager}
         */
        this.eventManager = eventManager;

    }


    getSamplesStates() {
        super.getSamplesStates();
    }

    getSample(tag) {
        super.getSample(tag);
    }

    async addSample(tag, filter) {
        super.addSample(tag, filter);
    }

    async deleteSample(tag) {
        super.deleteSample(tag);
    }

    async resumeSample(tag) {
        super.resumeSample(tag);
    }

    async pauseSample(tag) {
        super.pauseSample(tag);
    }

    setController( controller ) {
        this.strategy.setController( controller );
    }

    getController() {
        return this.strategy.getController();
    }

    setStrategy( strategy ) {
        this.strategy = strategy;
        this.strategy.setController( this.controller );
    }

    async fetch() {
        return this.strategy.fetch();
    }

    async store() {
        return this.strategy.store();
    }

    async start() {
        this.strategy.start();
    }

    /**
     *
     * @param tag {String}
     * @param item {SampleItem}
     */
    async addSampleItem( tag, item ) {

        /**
         * @type {Sample}
         */
        let sample = await this.controller.get( tag );
        if( sample ) {

            let event = new SampledEvent( sample.getDescriptor(), item );
            this.eventManager.emit( EventsManager.ENUM.EVENTS.SAMPLED, event );

            await sample.add( item );
            return StatusCodes.CREATED;
        }
        else {
            return StatusCodes.NOT_FOUND;
        }
    }


    async getSampleItems( tag ) {
        let sample = await this.controller.get( tag );
        let items = sample.getCollection().toArray();
        return items;
    }

    async add( tag, rawFilter ) {
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

    async get( tag ) {
        return this.controller.get( tag );
    }

    async resume( tag ) {
        let sample = this.controller.pausedSamples.get( tag );
        if( sample ) {
            console.log( `[${this.strategy.constructor.name}]`, "Request to resume sample", `"${tag}"` );
            let result = await this.strategy.resume( sample );
            switch( result ) {
                case StatusCodes.OK:

                    this.controller.activeSamples.set( tag, sample );
                    this.controller.pausedSamples.delete( tag );
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

    async pause( tag ) {
        let sample = this.controller.activeSamples.get( tag );
        if( sample ) {
            console.log( `[${this.strategy.constructor.name}]`, "Request to pause sample", `"${tag}"` );
            let result = await this.strategy.pause( sample );
            if( result === StatusCodes.OK) {
                this.controller.pausedSamples.set(tag, sample);
                this.controller.activeSamples.delete(tag);
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

    async delete( tag ) {
        console.log( `[${this.constructor.name}]`, "erasing sample", tag );
        try {
            let sample = await this.get( tag );
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