const CustomEvent = require("custom-event");

class UserConditionEvent extends CustomEvent {
    constructor( /*SampleDescriptor*/ descriptor ) {
        super(
            UserConditionEvent.name,
            {
                detail: {
                    descriptor
                }
            }
        );
    }
}

module.exports = UserConditionEvent;