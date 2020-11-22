const NotificationServiceHandler = require("./NotificationServiceHandler");
const TelegramNotificationService = require("../services/TelegramNotificationService");

class TelegramNotificationServiceHandler extends NotificationServiceHandler{
    constructor( ) {
        super( new TelegramNotificationService()  );
        this.nextHandler = null;
    }

    handleRequest( /*NotificationRequest*/request) {
        this.getService()
            .getContacts(request.tag)
            .forEach(
                (contact) => this.getService().send( contact, request.message)
            );
        if( this.nextHandler ) {
            return this.nextHandler.handleRequest( request );
        }
        else {
            return null;
        }
    }
}

module.exports = TelegramNotificationServiceHandler;