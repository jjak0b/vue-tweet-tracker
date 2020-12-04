class MyEventListener {
    constructor() {
    }

    /**
     *
     * @return {Function} handleEvent
     */
    getHandler() {
        /**
         * @this emitter
         * @param event
         */
        function handleEvent(/*MyEvent*/event) {

        }
        return handleEvent;
    }
}

module.exports = MyEventListener;