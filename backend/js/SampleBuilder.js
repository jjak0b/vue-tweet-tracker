const Sample = require("./Sample");
const SampleDescriptor = require("./SampleDescriptor");
const ItemsCollectionStorage = require("./ItemsCollectionStorage");
const FilterBuilder = require("./sampling/filters/FilterBuilder");
class SampleBuilder {

    constructor( /*String*/workingRoot) {
        this.workingRoot = workingRoot;
    }


    async fetch( tag ) {
        let jsonDescriptor = await fs.readJson(
            this.getSampleDescriptorLocation(tag),
            {encoding: "utf-8"}
        );
        let sampleDescriptor = SampleDescriptor.clone( jsonDescriptor );
        let sampleCollection = new ItemsCollectionStorage( this.getSampleCollectionLocation( tag ) );
        return new Sample( sampleDescriptor, sampleCollection );
    }

    build( /*String*/tag, filter) {
        filter = FilterBuilder.build( filter );
        let descriptor = new SampleDescriptor( tag, filter );
        let collection = new ItemsCollectionStorage( this.getSampleCollectionLocation( tag ) );
        return new Sample( descriptor, collection );
    }

    getSampleLocation( tag ) {
        return path.join( this.workingRoot, tag );
    }

    getSampleDescriptorLocation( tag ) {
        return path.join( this.getSampleLocation( tag ), "descriptor.json");
    }

    getSampleCollectionLocation( tag ) {
        return path.join( this.getSampleLocation( tag ), "collection.json");
    }

}

module.exports = SampleBuilder;