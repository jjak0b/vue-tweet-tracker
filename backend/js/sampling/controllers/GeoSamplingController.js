const SamplingController = require("./SamplingController");
const GeocodedFilter = require("../filters/GeocodedFilter");

class GeoSamplingController extends SamplingController {
    constructor( /*EventsManager*/eventManager, /*String*/workingDirectory ) {
        super( eventManager, workingDirectory);
    }

    add( tag /*String*/, filterData ) {
        let filter = new GeocodedFilter( filterData );
        super.add( tag, filter );
    }

    remove( tag /*String*/ ) {
        this.pause( tag );
        super.remove( tag );
    }

    resume( tag /*String*/ ) {

    }

    pause( tag /*String*/ ) {

    }
}

module.exports = GeoSamplingController;