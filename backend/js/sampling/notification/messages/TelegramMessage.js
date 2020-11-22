const Message = require("./Message");

class TelegramMessage extends Message{
    constructor( header, body ) {
        super( header, body )
    }

    toString(){
        this.message = this.getHeader() + '\n' + this.getBody()
    }
}

module.exports = TelegramMessage;