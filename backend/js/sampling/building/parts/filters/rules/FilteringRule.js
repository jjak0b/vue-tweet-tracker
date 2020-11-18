class FilteringRule {

    constructor( /*SamplingFilter*/ filter ) {
        /**
         * @type {SamplingFilter}
         */
        this.filter = filter;
    }

    /**
     * @returns {SamplingFilter}
     */
    getFilter() {
        return this.filter;
    }
}

module.exports = FilteringRule;