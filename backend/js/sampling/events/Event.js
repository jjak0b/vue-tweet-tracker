class Event {
    constructor(type /*String*/, data ) {
        this.type = type;
        this.message = data;
    }
}

module.exports = Event;