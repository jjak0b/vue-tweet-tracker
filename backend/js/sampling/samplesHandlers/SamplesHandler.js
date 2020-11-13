class SamplesHandler {
    constructor( controller /*SamplingController*/) {
        /**
         * @type {SamplesHandler}
         */
        this.nextHandler = null;

        this.controller = controller
    }

    setNextHandler( handler /*SamplesHandler*/) {
        this.nextHandler =  handler;
    }

    getController() {
        return this.controller;
    }

    handleRequest(/*SamplingRequest*/ request ) {
        if( this.canHandle( request ) ) {
            return this.getController();
        }
        else if( this.nextHandler ) {
            return this.nextHandler.handleRequest( request );
        }
        return null;
    }

    canHandle( /*SamplingRequest*/ request ) { return true };

}