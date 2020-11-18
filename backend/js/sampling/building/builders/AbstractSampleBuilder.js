class AbstractSampleBuilder {

    constructor() {
        /**
         *
         * @type {Sample}
         */
        this.sample = null;
    }

    createNewSample( tag, location ) {
        this.sample = new Sample( tag );
        this.sample.setLocation( location );
    }

    buildDescriptor( filter, location ) {}

    buildCollection( collection, location ) {}

    /**
     * @return {Sample}
     */
    getSample() {
        return this.sample;
    }

}

module.exports = AbstractSampleBuilder;