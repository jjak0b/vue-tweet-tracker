const MyEventListener = require("./MyEventListener");
const NotificationRequest = require("../sampling/notification/NotificationRequest");
const Message = require("../sampling/notification/messages/Message");
const TelegramNotificationServiceHandler = require("../sampling/notification/handlers/TelegramNotificationServiceHandler");

class UserConditionEventListener extends MyEventListener {
    constructor() {
        super();

        this.startHandler = new TelegramNotificationServiceHandler();
    }

    /**
     *
     * @return {Function} handleEvent
     */
    getHandler() {
        // use closure to provide reference of "this" into handleEvent
        let self = this;

        /** "this" here is of type {EventsManager}
         *  use "self" to reference to listener instance
         * @param userConditionEvent {UserConditionEvent}
         */
    function handleEvent( userConditionEvent ) {

        let descriptor = userConditionEvent.getDescriptor();
        let message = new Message(
            `## The event "${ descriptor.tag }" occurred !##`,
            `The event received ${descriptor.count} sampled items\nCheck the sampled items through the app dashboard !`
        );
        let request = new NotificationRequest( message, descriptor.tag );
        self.startHandler.handleRequest( request );
    }
        return handleEvent;

    }
}

module.exports = UserConditionEventListener;