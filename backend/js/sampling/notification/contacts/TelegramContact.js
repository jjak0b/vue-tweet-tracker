const Contact = require("./Contact");

class TelegramContact extends Contact{
    constructor( props = {events: [], chatid: null} ) {
        super(props);
        this.chatid = props.chatid;
    }
}

module.exports = TelegramContact;