const EventEmitter = require('events');
const SampledEventListener = require("../eventListeners/SampledEventListener");
const UserConditionEventListener = require("../eventListeners/UserConditionEventListener");

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
            SAMPLED: "sampled",
            USER_CONDITION: "userCondition"
        }
    }

    constructor() {
        super();

        this.addListener( EventsManager.ENUM.EVENTS.SAMPLED, SampledEventListener.handleEvent );
        this.addListener( EventsManager.ENUM.EVENTS.USER_CONDITION, UserConditionEventListener.handleEvent );
    }

}

module.exports = EventsManager;