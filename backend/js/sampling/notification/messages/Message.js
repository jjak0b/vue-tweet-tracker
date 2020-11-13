class Message {
    constructor( header, body ) {
        this._header = header;
        this._body = body;
    }

    getHeader() {
        return this._header;
    }

    setHeader(value) {
        this._header = value;
    }

    getBody() {
        return this._body;
    }

    setBody(value) {
        this._body = value;
    }
}

module.exports = Message;