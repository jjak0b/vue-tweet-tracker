const path = require("path");

class SampleDirector {
    constructor( workingLocation ) {
        /**
         * @type {AbstractSampleBuilder}
         */
        this.builder = null;
        this.location = workingLocation;
    }

    setBuilder( /*AbstractSampleBuilder*/ builder) {
        this.builder = builder;
    }

    constructSample( /*String*/tag, filter ) {
        let sampleLocation = path.join( this.location, tag )
        this.builder.createNewSample( tag, sampleLocation );
        this.builder.buildDescriptor( filter, path.join( sampleLocation, "descriptor.json") );
        this.builder.buildCollection( null, path.join( sampleLocation, "collection.json") );
    }

    // TODO: Does this should be here ?
    async deconstructSample( /*Sample*/sample ) {
        let location = sample.getLocation();
        await fs.rmdir( location, { recursive: true } );
    }

    /**
     *
     * @return {Sample}
     */
    getSample() {
        return this.builder.getSample();
    }
}

module.exports = SampleDirector;