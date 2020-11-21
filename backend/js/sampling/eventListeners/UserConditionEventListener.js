const MyEventListener = require("./MyEventListener");
const NotificationRequest = require("../notification/NotificationRequest");
const Message = require("../notification/messages/Message");
const TelegramNotificationServiceHandler = require("../notification/handlers/TelegramNotificationServiceHandler");

class UserConditionEventListener extends MyEventListener {
    constructor() {
        super();

        const telegramService = new TelegramNotificationServiceHandler();
        this.startHandler = telegramService;
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
        let message = new Message("", "");
        let request = new NotificationRequest( message );
        console.log(  `[${UserConditionEventListener.name}]`, descriptor.tag, descriptor.count );
        self.startHandler.handleRequest( request );
    }
        return handleEvent;

    }
}

module.exports = UserConditionEventListener;