const MyEvent = require("./MyEvent");

class UserConditionEvent extends MyEvent {
    constructor( /*SampleDescriptor*/ descriptor ) {
        super( UserConditionEvent.name, "User condition trigger");
        this.descriptor = descriptor;
    }

    /**
     *
     * @return {SampleDescriptor}
     */
    getDescriptor() {
        return this.descriptor;
    }
}

module.exports = UserConditionEvent;