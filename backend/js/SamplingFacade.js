const path = require("path");
const GeoSamplesHandler = require("./sampling/samplesHandlers/GeoSamplesHandler");

const ContextSamplesHandler = require("./sampling/samplesHandlers/ContextSamplesHandler");
const ContextSamplingStrategy = require("./sampling/strategies/ContextSamplingStrategy");
const SamplingController = require("./sampling/controllers/SamplingController");
const EventsManager = require("./sampling/services/EventsManager");
const Sampler =require("./sampling/Sampler");
const ISampler = require("./sampling/ISampler");


class SamplingFacade extends ISampler {
    constructor() {
        super();
        this.eventManager = EventsManager.getInstance();

        const contextSamplingStrategy = new ContextSamplingStrategy(
            new SamplingController( path.join( process.env.PATH_REPOSITORIES_SAMPLES, "context" ) )
        );
        // const geoSamplingStrategy = new GeoSamplingStrategy(
        //     new SamplingController( path.join( process.env.PATH_REPOSITORIES_SAMPLES, "geo" ) )
        // );

        this.sampler = new Sampler( this.eventManager );

        this.contextHandler = new ContextSamplesHandler( this.sampler, contextSamplingStrategy );
        // this.geoHandler = new GeoSamplesHandler( this.sampler, geoSamplingController );
        // this.contextHandler.setNextHandler( this.geoHandler );

        /**
         *
         * @type {SamplesHandler}
         */
        this.startHandler = this.contextHandler;

    }


    static instance = null;
    /**
     *
     * @type {SamplingFacade}
     */
    static getInstance() {
        if( !SamplingFacade.instance ) {
            SamplingFacade.instance = new SamplingFacade();
        }
        return SamplingFacade.instance;
    }

    async flush() {
        let controllers = [
            this.contextHandler.getSampler(),
            // this.geoHandler.getController(),
        ];
        for (const controller of controllers) {
            controller.stop().catch( (e)=>{ if(e) console.warn( e ) } );
            console.log( "flushing", controller.constructor.name );
            try {
                await controller.store()
            }
            catch (e) {
                console.error("Error while storing", controller.constructor.name, "reason:", e );
            }
        }
    }


    getSamplesStates() {
        return this.startHandler.getSamplesStates();
    }

    getSample(tag) {
        return this.startHandler.getSample( tag );
    }

    async getSampleItems(tag) {
        return this.startHandler.getSampleItems( tag );
    }

    async addSample(tag, filter) {
        return this.startHandler.addSample( tag, filter );
    }

    async deleteSample(tag) {
        return this.startHandler.deleteSample( tag );
    }

    async resumeSample(tag) {
        return this.startHandler.resumeSample( tag );
    }

    async pauseSample(tag) {
        return this.startHandler.pauseSample( tag );
    }

    async fetchSamples() {
        return this.startHandler.fetchSamples();
    }

    async storeSamples() {
        return this.startHandler.storeSamples();
    }
}

module.exports = SamplingFacade;