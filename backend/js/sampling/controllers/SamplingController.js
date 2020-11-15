const ItemsCollectionStorage = require("../../ItemsCollection");
const Path = require("path");

class SamplingController {
    constructor( /*EventsManager*/eventManager, path ) {
        this.eventManager = eventManager;
        /**
         * @type {Map<String, Sample>}
         */
        this.pausedSamples = new Map();
        /**
         * @type {Map<String, Sample>}
         */
        this.activeSamples = new Map();
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