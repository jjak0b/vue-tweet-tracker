const EventsManager = require("./sampling/services/EventsManager");
const UserConditionEventListener = require("./eventListeners/UserConditionEventListener");
const SampledEventListener = require("./eventListeners/SampledEventListener");

function init() {
    const eventManager = EventsManager.getInstance();
    const userConditionEventListener = new UserConditionEventListener();
    const sampledEventListener = new SampledEventListener();
    eventManager.addListener( EventsManager.ENUM.EVENTS.SAMPLED, sampledEventListener.getHandler() );
    eventManager.addListener( EventsManager.ENUM.EVENTS.USER_CONDITION, userConditionEventListener.getHandler() );
}

module.exports = {
    init: init
}