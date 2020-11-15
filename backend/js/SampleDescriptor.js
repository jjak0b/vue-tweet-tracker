const FilterBuilder = require("./sampling/filters/FilterBuilder");
const Filter = require("./Filter");

class SampleDescriptor {
    constructor( /*String*/tag, /*Filter*/filter ) {
        this.count = 0;
        this.tag = tag;
        this.filter = filter;
    }

    /**
     *
     * @returns {String}
     */
    getTag() {
        return this.tag;
    }

    /**
     *
     * @returns {Filter}
     */
    getFilter() {
        return this.filter;
    }

    /**
     *
     * @returns {number}
     */
    getCount() {
        return this.count;
    }

    /**
     *
     * @returns {number}
     */
    incCount() {
        ++this.count;
        return this.count;
    }
    /**
     *
     * @param rawObj
     * @returns {SampleDescriptor}
     */
    static clone( rawObj ) {
        let tag = rawObj.tag;
        let count = rawObj.count;
        let filter = FilterBuilder.build( rawObj.filter );
        let descriptor = new SampleDescriptor( tag, filter );

        descriptor.count = count;

        return descriptor;
    }
}

module.exports = SampleDescriptor;