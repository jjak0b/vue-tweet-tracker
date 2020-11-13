class SamplesHandler {
    constructor( controller /*SamplingController*/) {
        this.nextHandler = null;
        this.controller = controller
    }

    setNextHandler( handler /*SamplesHandler*/) {
        this.nextHandler =  handler;
    }

    getController() {
        return this.controller;
    }

    canHandle( /*SamplingRequest*/ request ) { return true };

}