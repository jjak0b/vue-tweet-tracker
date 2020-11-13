const SampleDescriptorCollection = require("../SampleDescriptorCollection");

class SamplingController {
    constructor( /*EventsManager*/eventManager ) {
        this.eventManager = eventManager;
        this.pausedSamples = new SampleDescriptorCollection();
        this.activeSamples = new SampleDescriptorCollection();
    }

    add( tag /*String*/, filter ) {
        this.pausedSamples.set( tag, filter );
    }

    remove( tag /*String*/ ) {
        this.pausedSamples.delete( tag );
    }

    resume( tag /*String*/ ) {
        let sampleDescriptor = this.pausedSamples.get( tag );

        if( sampleDescriptor ) {
            this.activeSamples.set( tag, sampleDescriptor );

            return this.pausedSamples.delete( tag );
        }
        return false;
    }

    pause( tag /*String*/ ) {
        let sampleDescriptor = this.activeSamples.get( tag );

        if( sampleDescriptor ) {
            this.pausedSamples.set( tag, sampleDescriptor );

            return this.activeSamples.delete( tag );
        }
        return false;
    }

    getPausedTags() {
        return this.pausedSamples.entries();
    }

    getActiveTags() {
        return this.activeSamples.entries();
    }
}

module.exports = SamplingController;