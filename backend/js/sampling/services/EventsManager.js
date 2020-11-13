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
        let sampledListeners = new SampledEventListener();
        let userConditionListeners = new UserConditionEventListener();
        this.addListener( EventsManager.ENUM.EVENTS.SAMPLED, sampledListeners.handleEvent );
        this.addListener( EventsManager.ENUM.EVENTS.USER_CONDITION, userConditionListeners.handleEvent );
    }

}

module.exports = EventsManager;