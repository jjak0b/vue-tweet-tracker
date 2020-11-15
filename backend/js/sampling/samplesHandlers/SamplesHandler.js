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

    /**
     *
     * @returns {SamplingController}
     */
    getController() {
        return this.controller;
    }

    /**
     *
     * @param request
     * @returns {SamplingController|null}
     */
    handleRequest(/*SamplingControllerRequest*/ request ) {
        if( this.canHandle( request ) ) {
            return this.getController();
        }
        else if( this.nextHandler ) {
            return this.nextHandler.handleRequest( request );
        }
        return null;
    }

    canHandle( /*SamplingControllerRequest*/ request ) { return true };

}