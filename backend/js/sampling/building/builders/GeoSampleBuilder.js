const AbstractSampleBuilder = require("./AbstractSampleBuilder");
const SampleDescriptor = require("../parts/SampleDescriptor");
const GeocodedFilter = require("../parts/filters/GeocodedFilter");
const ProxyJSONBufferedItemsCollection = require("../../../ProxyJSONBufferedItemsCollection");
const FSResourceStorage = require("../../../FSResourceStorage");
const FilteringRule = require("../parts/filters/rules/FilteringRule");

class GeoSampleBuilder extends AbstractSampleBuilder {
    constructor() {
        super();
    }

    createNewSample(tag, location) {
        super.createNewSample(tag, location);
        let sample = this.getSample();
        sample.setStorage( FSResourceStorage.getInstance() );
    }

    buildDescriptor( rawFilter, location ) {
        let filter = new GeocodedFilter( rawFilter );

        let tag = this.getSample().tag;

        let rule = new FilteringRule( filter );

        let descriptor = new SampleDescriptor( tag, rule, location );
        descriptor.setStorage( FSResourceStorage.getInstance() );

        this.getSample().setDescriptor(descriptor);
    }

    buildCollection( initBuffer, location ) {
        // items must be fetched with correct ones on remote first
        let collection = new ProxyJSONBufferedItemsCollection( location, initBuffer, 2 /*300*/ );
        this.getSample().setCollection( collection );
    }
}