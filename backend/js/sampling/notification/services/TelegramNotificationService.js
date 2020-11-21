const NotificationService = require("./NotificationService");
const telegramBot = require('/backend/js/TelegramBot');

class TelegramNotificationService extends NotificationService {
    constructor() {
        super()
    }

    send( /*TelegramContact*/contact, /*TelegramMessage*/ message ){
        telegramBot.alertEvent(contact,message);
    }
}

module.exports = TelegramNotificationService;