const AbstractSampleBuilder = require("./AbstractSampleBuilder");
const SampleDescriptor = require("../parts/SampleDescriptor");
const ContextFilteringRule = require("../parts/filters/rules/ContextFilteringRule");
const ContextFilter = require("../parts/filters/ContextFilter");
const JSONBufferedItemsCollection = require("../../../JSONBufferedItemsCollection");
const FSResourceStorage = require("../../../FSResourceStorage");

class ContextSampleBuilder extends AbstractSampleBuilder {
    constructor() {
        super();
    }


    createNewSample(tag, location) {
        super.createNewSample(tag, location);
        let sample = this.getSample();
        sample.setStorage( FSResourceStorage.getInstance() );
    }

    buildDescriptor( rawFilter, location ) {
        let filter = new ContextFilter( rawFilter );

        let tag = this.getSample().tag;

        let rule = new ContextFilteringRule( tag, null, filter);

        let descriptor = new SampleDescriptor( tag, rule, location );
        descriptor.setStorage( FSResourceStorage.getInstance() );

        this.getSample().setDescriptor(descriptor);
    }

    buildCollection( initBuffer, location ) {
        let collection = new JSONBufferedItemsCollection( location, initBuffer, 128 );
        this.getSample().setCollection( collection );
    }
}

module.exports = ContextSampleBuilder;