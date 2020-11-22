const path = require("path");
const GeoSamplesHandler = require("./sampling/samplesHandlers/GeoSamplesHandler");

const ContextSamplesHandler = require("./sampling/samplesHandlers/ContextSamplesHandler");
const ContextSamplingStrategy = require("./sampling/strategies/ContextSamplingStrategy");

const GeoSamplingStrategy = require("./sampling/strategies/GeoSamplingStrategy");
const EventsManager = require("./sampling/services/EventsManager");
const Sampler =require("./sampling/Sampler");
const ISampler = require("./sampling/ISampler");


class SamplingFacade extends ISampler {
    constructor() {
        super();
        this.eventManager = EventsManager.getInstance();

        const contextSamplingStrategy = new ContextSamplingStrategy(
            path.join( process.env.PATH_REPOSITORIES_SAMPLES || "", "context" ),
            this.eventManager
        );
        // const geoSamplingStrategy = new GeoSamplingStrategy(
        //     path.join( process.env.PATH_REPOSITORIES_SAMPLES, "geo" ),
        //     this.eventManager
        // );

        this.sampler = new Sampler( this.eventManager );

        this.contextHandler = new ContextSamplesHandler( this.sampler, contextSamplingStrategy );
        // this.geoHandler = new GeoSamplesHandler( this.sampler, geoSamplingStrategy );
        // this.contextHandler.setNextHandler( this.geoHandler );

        /**
         *
         * @type {SamplesHandler}
         */
        this.startHandler = this.contextHandler;

        this.startHandler.fetchSamples();
    }


    static instance = null;
    /**
     *
     * @return {SamplingFacade}
     */
    static getInstance() {
        if( !SamplingFacade.instance ) {
            SamplingFacade.instance = new SamplingFacade();
        }
        return SamplingFacade.instance;
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