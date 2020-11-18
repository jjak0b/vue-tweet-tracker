const EventEmitter = require('events');

class MyEventListener {
    constructor() {
    }

    /**
     * @this emitter
     * @param event
     */
    static handleEvent(/*MyEvent*/event) {}
}

module.exports = MyEventListener;