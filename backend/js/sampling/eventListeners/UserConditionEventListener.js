const EventListener = require("./EventListener");
const NotificationRequest = require("../notification/NotificationRequest");
const Message = require("../notification/messages/Message");

class UserConditionEventListener extends EventListener {
    constructor() {
        super();
    }

    handleEvent( /*UserConditionEvent*/ event ) {
        let descriptor = event.detail.descriptor;

        let message = new Message("", "");
        let request = new NotificationRequest( message );
    }
}

module.exports = UserConditionEventListener;