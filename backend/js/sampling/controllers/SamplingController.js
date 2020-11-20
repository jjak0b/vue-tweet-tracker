const path = require("path");
const AbstractStorableResource = require("../../AbstractStorableResource");
const SamplesStates = require("../SamplesStates");
const FSResourceStorage = require("../../FSResourceStorage");

class SamplingController extends AbstractStorableResource {
    constructor(/*String*/workingLocation ) {
        super(workingLocation);
        /**
         * @type {Map<String, Sample>}
         */
        this.pausedSamples = new Map();
        /**
         * @type {Map<String, Sample>}
         */
        this.activeSamples = new Map();


        this.samplesStates = new SamplesStates( path.join( this.getLocation(), "sampleStates.json" ) );
        this.samplesStates.setStorage( FSResourceStorage.getInstance() );
    }

    async fetch() {
        let fetchSuccess = true;
        try {
            await this.samplesStates.fetch();
        }
        catch ( e ) {
            fetchSuccess = false;
            if( e.code === "ENOENT" ) {
                console.log(`[${this.constructor.name}]`, "Init samples states" );
                await this.store();
            }
            else {
                console.error(`[${this.constructor.name}]`, "Error reading local sampleStates.json", "reason:", e);
            }
        }
        
        if( !fetchSuccess ) return;

        let sample;
        for (const tag of this.samplesStates.paused ) {
            // this sample is a placeholder to be fetched with real one
            this.sampleDirector.constructSample( tag, {} );
            sample = this.sampleDirector.getSample();

            try {
                // let sample to fetch
                await sample.fetch();
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error fetching local paused sample", tag, "; reason:", e );
            }
            this.pausedSamples.set(tag, sample);
        }

        for (const tag of this.samplesStates.active) {
            // this sample is a placeholder to be fetched with real one
            this.sampleDirector.constructSample( tag, {} );
            sample = this.sampleDirector.getSample();
            try {
                // let sample to fetch
                await sample.fetch();
                this.activeSamples.set( tag, sample );
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error fetching local active sample", tag, "; reason:", e );
                this.pausedSamples.set( tag, sample );
            }
        }
    }

    async store() {
        this.samplesStates.active = this.getActiveTags();
        this.samplesStates.paused = this.getPausedTags();

        try {
            await this.samplesStates.store();
        }
        catch ( e ) {
            console.error( `[${this.constructor.name}]`, "Error writing local sampleStates", "reason:", e );
        }

        for( const samples of [ this.activeSamples, this.pausedSamples ] ) {
            for (const [tag, sample] of samples) {
                try {
                    await sample.store();
                } catch (e) {
                    console.error(`[${this.constructor.name}]`, `Unable to store sample "${tag}"`, "\nreason:", e, "\ndata:", JSON.stringify(sample, null, 4));
                }
            }
        }
    }

    /**
     *
     * @param sample {Sample}
     * @return {Promise<void>}
     */
    async add( sample ) {
        console.log( `[${this.constructor.name}]`, "Add new sample -> to paused streams", sample );
        await sample.store();
        this.pausedSamples.set( sample.tag, sample );
    }

    async remove( /*String*/tag ) {
        this.pausedSamples.delete( tag );
    }

    get( /*String*/tag ) {
        let sample = this.activeSamples.get( tag );
        if( !sample )
            sample = this.pausedSamples.get( tag );
        return sample;
    }

    getPaused( tag ) {
        return this.pausedSamples.get( tag );
    }

    setPaused( tag, sample ) {
        this.pausedSamples.set( tag, sample );
        this.activeSamples.delete( tag );
    }

    getActive( tag ) {
        return this.pausedSamples.get( tag );
    }

    setActive( tag, sample ) {
        this.activeSamples.set( tag, sample );
        this.pausedSamples.delete( tag );
    }

    getPausedTags() {
        return Array.from( this.pausedSamples.keys() );
    }

    getActiveTags() {
        return Array.from( this.activeSamples.keys() );
    }
}

module.exports = SamplingController;