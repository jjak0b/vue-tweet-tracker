const Contact = require("./Contact");

class TelegramContact extends Contact{
    constructor( id ) {
        super();
        this.id = id;
    }
}

module.exports = TelegramContact;