const SamplesHandler = require("./SamplesHandler");
const ContextSamplingStrategy = require("../strategies/ContextSamplingStrategy");
const ContextFilter = require("../building/parts/filters/ContextFilter");
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
        filter = new ContextFilter( filter );
        let query = ContextSamplingStrategy.getQueryFromFilter( filter );
        return query.trim().length > 0;
    }
}

module.exports = ContextSamplesHandler;