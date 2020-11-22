class SamplingControllerRequest {
    constructor( tag, body ) {
        this._tag = tag;
        this._body = body;
    }

    get tag() {
        return this._tag;
    }

    set tag(value) {
        this._tag = value;
    }

    get body() {
        return this._body;
    }

    set body(value) {
        this._body = value;
    }
}

module.exports = SamplingControllerRequest;