const Message = require("./Message");

class TelegramMessage extends Message{
    constructor( message ) {
        super( message.getHeader(), message.getBody() )
    }

    toString(){
        return this.getHeader() + '\n' + this.getBody();
    }
}

module.exports = TelegramMessage;