class GeoSamplesHandler extends SamplesHandler {
    constructor( controller /*GeoSamplingController*/ ) {
        super(controller);
    }

    canHandle(request) {
        let canHandle = false;

        if( request && request.body && request.body.type === "geo" ) {
            canHandle = true;
        }

        return canHandle;
    }
}

module.exports = GeoSamplesHandler;