const path = require("path");
const GeoSamplesHandler = require("./sampling/samplesHandlers/GeoSamplesHandler");
const GeoSamplingController = require("./sampling/controllers/GeoSamplingController");
const ContextSamplesHandler = require("./sampling/samplesHandlers/ContextSamplesHandler");
const ContextSamplingController = require("./sampling/controllers/ContextSamplingController");
const EventsManager = require("./sampling/services/EventsManager");

class SamplingFacade {
    constructor() {
        this.eventManager = EventsManager.getInstance();

        this.contextController = new ContextSamplingController(
            this.eventManager,
            path.join(global.__basedir, process.env.PATH_REPOSITORIES_SAMPLES, "context")
        );
        this.contextHandler = new ContextSamplesHandler( this.contextController );

        this.geoController = new GeoSamplingController(
            this.eventManager,
            path.join(global.__basedir, process.env.PATH_REPOSITORIES_SAMPLES, "geo")
        );
        this.geoHandler = new GeoSamplesHandler( this.geoController );

        this.contextHandler.setNextHandler( this.geoHandler );

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

    /**
     *
     * @param request
     * @returns {SamplingController|null}
     */
    request( /*SamplingControllerRequest*/ request) {
        return this.startHandler.handleRequest( request );
    }
}

module.exports = SamplingFacade;