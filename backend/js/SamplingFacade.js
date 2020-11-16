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


        const onCleanup = async () => {
            let controllers = [
                this.contextHandler.getController(),
                this.geoHandler.getController(),
            ];
            for (const controller of controllers) {
                console.log( "flushing", controller.constructor.name );
                for (const activeTag of controller.getActiveTags()) {
                    let sample = await controller.get( activeTag );
                    if( sample ) {
                        console.log( "flushing sample", sample.tag );
                        await sample.getCollection().flush();
                    }
                }
            }
        };

        const exitHandler = async (options, exitCode) => {
            if (options.cleanup){
                await onCleanup();
            }
            if (exitCode || exitCode === 0) console.log(exitCode);
            if (options.exit) process.exit();
        }

        //do something when app is closing
        process.on('exit', exitHandler.bind(this,{cleanup:true}));

        //catches ctrl+c event
        process.on('SIGINT', exitHandler.bind(this, {exit:true}));

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', exitHandler.bind(this, {exit:true}));
        process.on('SIGUSR2', exitHandler.bind(this, {exit:true}));

        //catches uncaught exceptions
        process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
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