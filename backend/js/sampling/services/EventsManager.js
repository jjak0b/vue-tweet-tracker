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

        const userConditionEventListener = new UserConditionEventListener();
        const sampledEventListener = new SampledEventListener()
        this.addListener( EventsManager.ENUM.EVENTS.SAMPLED, sampledEventListener.getHandler() );
        this.addListener( EventsManager.ENUM.EVENTS.USER_CONDITION, userConditionEventListener.getHandler() );
    }

}

module.exports = EventsManager;