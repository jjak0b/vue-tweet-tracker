const Message = require("./Message");

class TelegramMessage extends Message{
    constructor( header, body ) {
        super( header, body )
    }
}

module.exports = TelegramMessage;