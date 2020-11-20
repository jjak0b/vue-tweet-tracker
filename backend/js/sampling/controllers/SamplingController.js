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

    /**
     *
     * @return {Promise<SamplesStates>}
     */
    async fetch() {
        let fetchSuccess = true;
        try {
            return this.samplesStates.fetch();
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
        return this.samplesStates;
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

    /**
     *
     * @param tag
     * @return {Promise<void>}
     */
    remove( /*String*/tag ) {
        this.pausedSamples.delete( tag );
    }

    /**
     *
     * @param tag
     * @return {Sample}
     */
    get( /*String*/tag ) {
        let sample = this.activeSamples.get( tag );
        if( !sample )
            sample = this.pausedSamples.get( tag );
        return sample;
    }

    /**
     *
     * @param tag
     * @return {Sample}
     */
    getPaused( tag ) {
        return this.pausedSamples.get( tag );
    }

    setPaused( tag, sample ) {
        this.pausedSamples.set( tag, sample );
        this.activeSamples.delete( tag );
    }

    /**
     *
     * @param tag
     * @return {Sample}
     */
    getActive( tag ) {
        return this.pausedSamples.get( tag );
    }

    setActive( tag, sample ) {
        this.activeSamples.set( tag, sample );
        this.pausedSamples.delete( tag );
    }

    /**
     *
     * @return {String[]}
     */
    getPausedTags() {
        return Array.from( this.pausedSamples.keys() );
    }

    /**
     *
     * @return {String[]}
     */
    getActiveTags() {
        return Array.from( this.activeSamples.keys() );
    }
}

module.exports = SamplingController;