const NotificationService = require("./NotificationService");

class TelegramNotificationService extends NotificationService {
    constructor() {
        super()
    }

    send( /*TelegramContact*/contact, /*TelegramMessage*/ message ){
        super.send( contact, message );
    }
}

module.exports = TelegramNotificationService;