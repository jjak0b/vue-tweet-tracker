const Event = require("./Event");

class UserConditionEvent extends Event {
    constructor( /*SampleDescriptor*/ descriptor ) {
        super( UserConditionEvent.name, descriptor );
    }
}

module.exports = UserConditionEvent;