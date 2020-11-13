const CustomEvent = require("custom-event");


class SampledEvent extends CustomEvent {
    constructor( /*SampleDescriptor*/ descriptor , sampled ) {
        super(
            SampledEvent.name,
            {
                detail: {
                    descriptor,
                    sampled,
                }
            }
        );
    }
}

module.exports = SampledEvent;