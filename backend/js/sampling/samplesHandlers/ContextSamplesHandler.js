class ContextSamplesHandler extends SamplesHandler {
    constructor( controller /*ContextSamplingController*/ ) {
        super(controller);
    }

    canHandle(request) {
        let canHandle = false;

        if( request && request.body && request.body.type === "context" ) {
            canHandle = true;
        }

        return canHandle;
    }
}

module.exports = ContextSamplesHandler;