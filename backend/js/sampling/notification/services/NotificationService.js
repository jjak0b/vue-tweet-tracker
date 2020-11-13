class NotificationService {
    constructor() {
        this.contacts = [];
    }

    send( /*Contact*/contact, /*Message*/ message ){
        throw new Error( `[${this.constructor.name}]: "missing sending implementation` );
    }

    getContacts(){
        return this.contacts;
    }
}

module.exports = NotificationService;