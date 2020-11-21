const AbstractStorableResource = require("../../../AbstractStorableResource");

class SampleDescriptor extends AbstractStorableResource{
    constructor( /*String*/tag, /*FilteringRule*/rule, location) {
        super( location );
        this.count = 0;
        this.tag = tag;
        this.rule = rule;

        this.event = {
            countRequired : -1,
            submitted: false
        }
    }

    getEvent() {
        return this.event;
    }

    setEvent(eventData) {
        this.event.countRequired = eventData.countRequired || this.event.countRequired;
    }

    /**
     *
     * @returns {String}
     */
    getTag() {
        return this.tag;
    }

    /**
     *
     * @returns {FilteringRule}
     */
    getRule() {
        return this.rule;
    }

    /**
     *
     * @returns {number}
     */
    getCount() {
        return this.count;
    }

    /**
     *
     * @returns {number}
     */
    incCount() {
        ++this.count;
        return this.count;
    }

    toJSON() {
        return {
            count: this.count,
            tag : this.tag,
            rule: this.rule,
            event: this.event,
        }
    }

    async onFetch(data) {
        data = JSON.parse( data );
        this.count = data.count;
        this.tag = data.tag;
        this.rule = Object.assign( this.rule, data.rule );
        this.event = Object.assign( this.event. data.event );
        return this;
    }

    async onStore() {
        return JSON.stringify( this, null, 4 );
    }
}

module.exports = SampleDescriptor;