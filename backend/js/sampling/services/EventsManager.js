const EventEmitter = require('events');

class EventsManager extends EventEmitter{

    static instance = null;

    /**
     *
     * @returns {EventsManager}
     */
    static getInstance() {
        if( !EventsManager.instance ) {
            EventsManager.instance = new EventsManager();
        }
        return EventsManager.instance;
    }

    static ENUM = {
        EVENTS: {
            REGISTER_TIMER: "registerTimer",
            POST_SAMPLE_SUMMARY: "postSampleSummary",
            SAMPLED: "sampled",
            USER_CONDITION: "userCondition"
        }
    }

    constructor() {
        super();

    }

}

module.exports = EventsManager;