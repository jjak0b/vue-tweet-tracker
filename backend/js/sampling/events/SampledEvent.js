const CustomEvent = require("./MyEvent");

class SampledEvent extends CustomEvent {
    constructor( /*SampleDescriptor*/ descriptor, /*SampleItem*/sampled ) {
        super( SampledEvent.name, "Sampled new item");
        /**
         * @type {SampleDescriptor}
         */
        this.descriptor = descriptor;
        /**
         * @type {SampleItem}
         */
        this.sampled = sampled;
    }

    /**
     * @return {SampleItem}
     */
    getSampled() {
        return this.sampled;
    }

    /**
     * @return {SampleDescriptor}
     */
    getDescriptor() {
        return this.descriptor;
    }
}

module.exports = SampledEvent;