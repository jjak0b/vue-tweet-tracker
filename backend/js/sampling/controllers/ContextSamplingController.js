const SamplingController = require("./SamplingController");
const ContextFilter = require("../../filters/ContextFilter");

class ContextSamplingController extends SamplingController {
    constructor( /*EventsManager*/eventManager ) {
        super( eventManager );
    }

    add( tag /*String*/, filterData ) {
        let filter = new ContextFilter( filterData );
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

module.exports = ContextSamplingController;