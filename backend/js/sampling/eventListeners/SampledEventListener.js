const EventListener = require("./EventListener");
const EventsManager = require("../services/EventsManager");
const UserConditionEvent = require( "../events/UserConditionEvent");

class SampledEventListener extends EventListener {
    constructor() {
        super();
    }

    handleEvent(/*SampledEvent*/ event ) {
        let descriptor = event.detail.descriptor;

        // example
        // if( descriptor.count >= descriptor.countMax )
        {
            EventsManager.getInstance().emit(
                EventsManager.ENUM.EVENTS.USER_CONDITION,
                new UserConditionEvent( descriptor )
            );
        }
    }
}

module.exports = SampledEventListener;