class ISampler {
    constructor() {

    }

    /**
     *
     * @return {Map<String, []>}
     */
    getSamplesStates() {}

    /**
     *
     * @param tag {String}
     */
    getSample( tag ) {}

    /**
     *
     * @param tag {String}
     * @return {Promise<*>}
     */
    async getSampleItems( tag ) {}

    /**
     *
     * @param tag {String}
     * @param filter
     * @return {Promise<*>}
     */
    async addSample( tag, filter ) {}

    /**
     *
     * @param tag {String}
     * @return {Promise<*>}
     */
    async deleteSample( tag ) {}

    /**
     *
     * @param tag {String}
     * @return {Promise<*>}
     */
    async resumeSample( tag ) {}

    /**
     *
     * @param tag {String}
     * @return {Promise<*>}
     */
    async pauseSample( tag ) {}

    /**
     *
     * @return {Promise<void>}
     */
    async fetchSamples() {}

    /**
     *
     * @return {Promise<void>}
     */
    async storeSamples() {}
}

module.exports = ISampler;