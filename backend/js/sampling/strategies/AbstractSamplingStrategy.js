const SampleDirector = require("../building/directors/SampleDirector");
const SampledEvent = require("../../events/SampledEvent");

class AbstractSamplingStrategy {
    /**
     *
     * @param controller {SamplingController}
     * @param eventsManager {EventsManager}
     */
    constructor( controller, eventsManager ) {

        this.controller = controller;
        /**
         *
         * @type {SampleDirector}
         */
        this.sampleDirector = new SampleDirector();

        this.eventsManager = eventsManager;
    }


    /**
     *
     * @return {SampleDirector}
     */
    getDirector() {
        return this.sampleDirector;
    }

    setDirector( /*SampleDirector*/director ) {
        this.sampleDirector = director;
    }

    /**
     *
     * @return {SamplingController}
     */
    getController() {
        return this.controller;
    }

    setController( /*SamplingController*/ controller ) {
        this.controller = controller;
    }

    /**
     *
     * @return {Sample}
     */
    create( tag, filter ) {
        this.sampleDirector.constructSample( tag, filter );
        return this.sampleDirector.getSample();
    }

    async add( tag, filter ) {

    }

    /**
     *
     * @param sample {Sample}
     */
    async delete( sample ) {
        this.sampleDirector.deconstructSample( sample );
    }

    /**
     * @return {Promise<void>}
     */
    async fetch( ) {

    }

    async start() {

    }

    async stop() {

    }

    /**
     *
     * @param sample {Sample}
     * @return {Promise<void>}
     */
    async resume( sample ) {}

    /**
     *
     * @param sample {Sample}
     * @return {Promise<void>}
     */
    async pause( sample ) {}


    /**
     *
     * @param sample {Sample}
     * @param item {SampleItem}
     */
    async addItem( sample, item ) {
        await sample.add( item );
        let event = new SampledEvent( sample.getDescriptor(), item );
        this.eventsManager.emit( this.eventsManager.constructor.ENUM.EVENTS.SAMPLED, event );
    }
}

module.exports = AbstractSamplingStrategy;