const path = require("path");
const SampleDirector = require("../building/directors/SampleDirector");
const AbstractStorableResource = require("../../AbstractStorableResource");
const SamplesStates = require("../SamplesStates");

class SamplingController extends AbstractStorableResource{
    constructor( /*EventsManager*/eventManager, /*String*/workingLocation ) {
        super(workingLocation);
        this.eventManager = eventManager;

        /**
         * @type {Map<String, Sample>}
         */
        this.pausedSamples = new Map();
        /**
         * @type {Map<String, Sample>}
         */
        this.activeSamples = new Map();

        this.sampleDirector = new SampleDirector( this.getLocation() );
        this.samplesStates = new SamplesStates( path.join( this.getLocation(), "sampleStates.json" ) );
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

    async start() {
        await this.fetch();
    }

    async stop() {
        return Promise.resolve();
    }

    async add( tag /*String*/, filter ) {
        this.sampleDirector.constructSample( tag, filter );
        let sample = this.sampleDirector.getSample();
        await sample.store();
        console.log( `[${this.constructor.name}]`, "Add new sample -> to paused streams", sample );
        this.pausedSamples.set( tag, sample );
    }

    async remove( tag /*String*/ ) {
        let sample = await this.get( tag );

        console.log( `[${this.constructor.name}]`, "erasing sample", tag );
        try {
            await this.sampleDirector.deconstructSample( sample );
            console.log( `[${this.constructor.name}]`, "Remove sample to paused streams", tag );
            this.pausedSamples.delete( tag );
        }

        catch ( e ) {
            if( e.code === "ENOENT" ) {
                console.warn(`[${this.constructor.name}]`, "Attempting to remove a not concrete sample", `"${tag}"\n`, "\ndetails:", sample, "\nreason:", e );
            }
            else {
                console.error(`[${this.constructor.name}]`, "Error erasing local sample\n", sample, "\nreason:", e);
            }
        }
    }

    async resume( tag /*String*/ ) {
        let sample = this.pausedSamples.get( tag );

        if( sample ) {
            this.activeSamples.set( tag, sample );

            return this.pausedSamples.delete( tag );
        }
        return false;
    }

    async pause( tag /*String*/ ) {
        let sample = this.activeSamples.get( tag );

        if( sample ) {
            this.pausedSamples.set( tag, sample );
            this.activeSamples.delete( tag );

            try {
                await sample.store();
                return true;
            }
            catch (e) {
                return false;
            }
        }
        return false;
    }

    async get( /*String*/tag ) {
        let sample = this.activeSamples.get( tag );
        if( !sample )
            sample = this.pausedSamples.get( tag );
        return sample;
    }

    getPausedTags() {
        return Array.from( this.pausedSamples.keys() );
    }

    getActiveTags() {
        return Array.from( this.activeSamples.keys() );
    }
}

module.exports = SamplingController;