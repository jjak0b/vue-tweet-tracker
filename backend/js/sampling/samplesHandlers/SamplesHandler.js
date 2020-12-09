const StatusCodes = require("http-status-codes").StatusCodes;

const ISampler = require("../ISampler");

const Timer = require('../../events/Timer');

class SamplesHandler extends ISampler {
    /**
     *
     * @param sampler {Sampler}
     * @param strategy {AbstractSamplingStrategy}
     */
    constructor( sampler, strategy) {
        super();
        /**
         * @type {SamplesHandler}
         */
        this.nextHandler = null;

        /**
         *
         * @type {AbstractSamplingStrategy}
         */
        this.strategy = strategy;

        /**
         * @type {Sampler}
         */
        this.sampler = sampler;

    }

    setNextHandler( handler ) {
        this.nextHandler =  handler;
    }

    getStrategy() {
        return this.strategy;
    }

    getSampler() {
        return this.sampler;
    }

    canHandleByTag( tag ) {
        this.sampler.setStrategy( this.strategy );

        return !!this.sampler.getSample(tag);
    }

    canHandleByFilter( filter ) {
        this.sampler.setStrategy( this.strategy );

        return false;
    }

    getSamplesStates() {
        this.sampler.setStrategy( this.strategy );

        let states = this.sampler.getSamplesStates();

        if( this.nextHandler ) {
            let nextStates = this.nextHandler.getSamplesStates();

            states.forEach(
                (tags, state, arrayStates) =>
                    arrayStates.set( state, tags.concat( nextStates.get( state ) ) )
            );
        }

        return states;
    }

    getSample(tag) {
        this.sampler.setStrategy( this.strategy );

        let sample = this.sampler.getSample( tag );

        if( sample ) {
            return sample;
        }
        else if( this.nextHandler ) {
            return this.nextHandler.getSample(tag);
        }
    }

    IsSampleHandledByAny( tag ) {
        this.sampler.setStrategy( this.strategy );
        let hasSample = !!this.sampler.getSample(tag);
        if( this.nextHandler ) {
            hasSample = hasSample || this.nextHandler.IsSampleHandledByAny( tag );
        }
        return hasSample;
    }

    async getSampleItems( tag ) {
        this.sampler.setStrategy( this.strategy );
        if( this.canHandleByTag( tag ) ) {
            return this.sampler.getSampleItems( tag );
        }
        else if( this.nextHandler ) {
            return this.nextHandler.getSampleItems( tag );
        }
        return Promise.reject( StatusCodes.NOT_FOUND );
    }

    async addSample( tag, filter ) {

        this.sampler.setStrategy( this.strategy );
        // Force unique tag samples for all handler
        let isHandledByAny = false;
        if ( this.canHandleByFilter(filter) ) {
            isHandledByAny = this.IsSampleHandledByAny( tag )
            this.sampler.setStrategy( this.strategy );
            if( !isHandledByAny ) {
                return await this.sampler.addSample(tag, filter);
            }
        }
        if (!isHandledByAny && this.nextHandler) {
            return this.nextHandler.addSample(tag, filter);
        }
        else if( isHandledByAny ) {
            return StatusCodes.CONFLICT;
        }
        return StatusCodes.NOT_IMPLEMENTED;
    }

    async deleteSample( tag ) {
        this.sampler.setStrategy( this.strategy );

        if( this.canHandleByTag( tag ) ) {
            return this.sampler.deleteSample( tag );
        }
        else if( this.nextHandler ) {
            return this.nextHandler.deleteSample( tag );
        }
        return StatusCodes.NOT_FOUND;
    }

    async resumeSample( tag ) {
        this.sampler.setStrategy( this.strategy );

        if( this.canHandleByTag( tag ) ) {
            return this.sampler.resumeSample( tag );
        }
        else if( this.nextHandler ) {
            return this.nextHandler.resumeSample( tag );
        }
        return StatusCodes.NOT_FOUND;
    }

    async pauseSample( tag ) {
        this.sampler.setStrategy( this.strategy );

        if( this.canHandleByTag( tag ) ) {
            return this.sampler.pauseSample( tag );
        }
        else if( this.nextHandler ) {
            return this.nextHandler.pauseSample( tag );
        }
        return StatusCodes.NOT_FOUND;
    }

    async fetchSamples() {
        this.sampler.setStrategy( this.strategy );
        await this.sampler.fetch();
        if( this.nextHandler)
            await this.nextHandler.fetchSamples();
    }

    async storeSamples() {
        this.sampler.setStrategy( this.strategy );
        await this.sampler.store();
        if( this.nextHandler)
            await this.nextHandler.storeSamples();
    }

}

module.exports = SamplesHandler;