const MyEventListener = require("./MyEventListener");
const NotificationRequest = require("../notification/NotificationRequest");
const Message = require("../notification/messages/Message");

class UserConditionEventListener extends MyEventListener {
    constructor() {
        super();
    }

    /**
     * @param sampledEvent {UserConditionEvent}
     */
    static handleEvent( /*UserConditionEvent*/ userConditionEvent ) {
        /**
         * @type {EventsManager}
         */
        let self = this;

        let descriptor = userConditionEvent.getDescriptor();
        let message = new Message("", "");
        let request = new NotificationRequest( message, descriptor.tag );
        console.log(  `[${UserConditionEventListener.name}]`, descriptor.tag, descriptor.count );
    }
}

module.exports = UserConditionEventListener;