const EventsManager = require("./sampling/services/EventsManager");
const UserConditionEventListener = require("./eventListeners/UserConditionEventListener");
const SampledEventListener = require("./eventListeners/SampledEventListener");
const PostSocialContentEventListener = require("./eventListeners/PostSocialContentEventListener");
const SocialContentProvider = require("./posting/SocialContentProvider");
const SamplingFacade = require("./SamplingFacade");

function init() {
    const eventManager = EventsManager.getInstance();

    const userConditionEventListener = new UserConditionEventListener();
    const sampledEventListener = new SampledEventListener();

    const socialContentProvider = new SocialContentProvider();
    const samplingFacade = SamplingFacade.getInstance();
    const postSocialContentListener = new PostSocialContentEventListener( socialContentProvider, samplingFacade );

    eventManager.addListener( EventsManager.ENUM.EVENTS.SAMPLED, sampledEventListener.getHandler() );
    eventManager.addListener( EventsManager.ENUM.EVENTS.USER_CONDITION, userConditionEventListener.getHandler() );
    eventManager.addListener( EventsManager.ENUM.EVENTS.POST_SAMPLE_SUMMARY, postSocialContentListener.getHandler() );
}

module.exports = {
    init: init
}