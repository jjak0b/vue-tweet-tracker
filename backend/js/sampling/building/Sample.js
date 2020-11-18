const AbstractStorableResource = require("../../AbstractStorableResource");

class Sample extends AbstractStorableResource {
    constructor( tag ) {
        super(null);
        this.tag = tag;
        /**
         * @type {SampleDescriptor}
         */
        this.descriptor = null;
        /**
         *
         * @type {ItemsCollection}
         */
        this.collection = null;
    }

    async fetch() {
        return Promise.all(
            [
                this.descriptor.fetch(),
                // this.collection.store() // don't cache the full collection list
            ]
        );
    }

    async store() {
        return Promise.all(
            [
                this.descriptor.store(),
                this.collection.store()
            ]
        );
    }

    setDescriptor(descriptor) {
        this.descriptor = descriptor;
    }

    setCollection(collection) {
        this.collection = collection;
    }

    async add( /*SampleItem*/ sampleItem ) {
        return this.collection.add( sampleItem );
    }

    /**
     *
     * @returns {ItemsCollection}
     */
    getCollection( ) {
        return this.collection;
    }

    /**
     *
     * @returns {SampleDescriptor}
     */
    getDescriptor() {
        return this.descriptor;
    }
}

module.exports = Sample;