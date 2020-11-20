const SamplesHandler = require("./SamplesHandler");

class ContextSamplesHandler extends SamplesHandler {

    /**
     *
     * @param sampler {Sampler}
     * @param strategy {AbstractSamplingStrategy}
     */
    constructor(sampler, strategy) {
        super(sampler, strategy);
    }

    canHandleByFilter(filter) {
        return filter.context && filter.locations && filter.locations.length > 0;
    }
}

module.exports = ContextSamplesHandler;