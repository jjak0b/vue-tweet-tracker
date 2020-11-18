const AbstractStorableResource = require("../AbstractStorableResource");

class SamplesStates extends AbstractStorableResource {
    constructor( location ) {
        super( location );

        /**
         * @type {*[]}
         */
        this.active = [];

        /**
         * @type {*[]}
         */
        this.paused = [];
    }

    toJSON() {
        return {
            active : this.active,
            paused: this.paused
        };
    }

    async onFetch(value) {
        value = JSON.parse( value );

        this.active = value.active;
        this.paused = value.paused;

        return this;
    }

    async onStore() {
       return JSON.stringify( this );
    }
}

module.exports = SamplesStates;