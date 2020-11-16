const path = require("path");
const SampleBuilder = require("../../SampleBuilder");
const fs = require("fs-extra");

class SamplingController {
    constructor( /*EventsManager*/eventManager, /*String*/workingDirectory ) {
        this.eventManager = eventManager;
        this.workingDirectory = workingDirectory;

        fs.ensureDirSync(this.workingDirectory);
        /**
         * @type {Map<String, Sample>}
         */
        this.pausedSamples = new Map();
        /**
         * @type {Map<String, Sample>}
         */
        this.activeSamples = new Map();

        this.sampleBuilder = new SampleBuilder( this.workingDirectory );
    }

    async fetch() {

        let sampleStatesFilename = path.join( this.workingDirectory, "sampleStates.json" );

        let samplesStates;
        try {
            samplesStates = await fs.readJson(
                sampleStatesFilename,
                {
                    encoding: "utf-8"
                }
            );
        }
        catch ( e ) {
            if( e.code === "ENOENT" ) {
                this.update();
            }
            else {
                console.error(`[${this.constructor.name}]`, "Error reading local sampleStates.json", "reason:", e);
            }
        }
        
        if( !samplesStates ) return;

        let sample;
        for (const tag of samplesStates.paused) {
            try {
                sample = await this.sampleBuilder.fetch(tag);
                if( sample )
                    this.pausedSamples.set(tag, sample);
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error fetching local paused sample", tag, "; reason:", e );
            }
        }

        for (const tag of samplesStates.active) {
            try {
                sample = await this.sampleBuilder.fetch( tag );
                if( sample )
                    this.activeSamples.set( tag, sample );
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error fetching local active sample", tag, "; reason:", e );
            }
        }
    }

    async update() {
        let sampleStatesFilename = path.join( this.workingDirectory, "sampleStates.json" );

        try {
            await fs.writeJson(
                sampleStatesFilename,
                {
                    active: this.getActiveTags(),
                    paused: this.getPausedTags(),
                },
                {
                    encoding: "utf-8"
                }
            );
        }
        catch ( e ) {
            console.error( `[${this.constructor.name}]`, "Error writing local sampleStates.json", "reason:", e );
        }
    }

    async start() {
        await this.fetch();
    }

    async add( tag /*String*/, filter ) {
        let sample = this.sampleBuilder.build(
            tag,
            filter
        );
        console.log( `[${this.constructor.name}]`, "Add new sample to paused streams", sample );
        this.pausedSamples.set( tag, sample );
    }

    async remove( tag /*String*/ ) {
        this.pausedSamples.delete( tag );
    }

    async resume( tag /*String*/ ) {
        let sampleDescriptor = this.pausedSamples.get( tag );

        if( sampleDescriptor ) {
            this.activeSamples.set( tag, sampleDescriptor );

            return this.pausedSamples.delete( tag );
        }
        return false;
    }

    async pause( tag /*String*/ ) {
        let sampleDescriptor = this.activeSamples.get( tag );

        if( sampleDescriptor ) {
            this.pausedSamples.set( tag, sampleDescriptor );

            return this.activeSamples.delete( tag );
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