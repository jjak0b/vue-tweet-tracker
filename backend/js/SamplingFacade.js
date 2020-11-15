const GeoSamplesHandler = require("./sampling/samplesHandlers/GeoSamplesHandler");
const GeoSamplingController = require("./sampling/controllers/GeoSamplingController");
const ContextSamplesHandler = require("./sampling/samplesHandlers/ContextSamplesHandler");
const ContextSamplingController = require("./sampling/controllers/ContextSamplingController");
const EventsManager = require("../services/EventsManager");

class SamplingFacade {
    constructor() {
        this.eventManager = EventsManager.getInstance();

        this.contextController = new ContextSamplingController( this.eventManager );
        this.contextHandler = new ContextSamplesHandler( this.contextController );

        this.geoController = new GeoSamplingController( this.eventManager );
        this.geoHandler = new GeoSamplesHandler( this.geoController );

        this.contextHandler.setNextHandler( this.geoHandler );

        this.startHandler = this.contextHandler;
    }

    /**
     *
     * @type {SamplingFacade}
     */
    static instance = null;
    static getInstance() {
        if( !SamplingFacade.instance ) {
            SamplingFacade.instance = new SamplingFacade();
        }
        return SamplingFacade.instance;
    }

    request( /*SamplingControllerRequest*/ request) {
        return this.startHandler.handleRequest( request );
    }
}

module.exports = SamplingFacade;