const EventListener = require("./MyEventListener");
const UserConditionEvent = require( "../events/UserConditionEvent");
const SampledEvent = require("../events/SampledEvent");

class SampledEventListener extends EventListener {

    constructor() {
        super();
    }

    /**
     *
     * @return {Function} handleEvent
     */
    getHandler() {
        // let self = this;
        /**
         * @param sampledEvent {SampledEvent}
         */
        function handleEvent(sampledEvent){
            // this @type {EventsManager}
            let descriptor = sampledEvent.getDescriptor();
            let event = descriptor.getEvent();
            if ( event.countRequired > 0 && descriptor.count >= event.countRequired && !event.submitted ) {
                event.submitted = true;
                this.emit(
                    this.constructor.ENUM.EVENTS.USER_CONDITION,
                    new UserConditionEvent(descriptor)
                );
            }
        }
        return handleEvent;
    }
}

module.exports = SampledEventListener;