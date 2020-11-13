const Event = require("./Event");

class SampledEvent extends Event {
    constructor( /*SampleDescriptor*/ descriptor , sampled ) {
        super( SampledEvent.name, descriptor );
        this.sampledData = sampled;
    }
}

module.exports = SampledEvent;