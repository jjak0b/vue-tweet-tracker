const EventListener = require("./MyEventListener");
const EventsManager = require("../services/EventsManager");
const UserConditionEvent = require( "../events/UserConditionEvent");
const SampledEvent = require("../events/SampledEvent");

class SampledEventListener extends EventListener {

    constructor() {
        super();
    }

    /**
     * @param sampledEvent {SampledEvent}
     */
    static handleEvent( sampledEvent ) {
        /**
         * @type {EventsManager}
         */
        let self = this;
        let descriptor = sampledEvent.getDescriptor();
        // example
        // if( descriptor.count >= descriptor.size ) {
            self.emit(
                self.constructor.ENUM.EVENTS.USER_CONDITION,
                new UserConditionEvent( descriptor )
            );
        // }
    }
}

module.exports = SampledEventListener;