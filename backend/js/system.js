const EventsManager = require("./sampling/services/EventsManager");
const UserConditionEventListener = require("./eventListeners/UserConditionEventListener");
const SampledEventListener = require("./eventListeners/SampledEventListener");
const PostSocialContentEventListener = require("./eventListeners/PostSocialContentEventListener");
const SocialContentProvider = require("./posting/SocialContentProvider");
const SamplingFacade = require("./SamplingFacade");
const PeriodicSocialPostingTimersHandler = require("./posting/handlers/PeriodicSocialPostingTimersHandler");

function init() {
    const eventManager = EventsManager.getInstance();

    const userConditionEventListener = new UserConditionEventListener();
    const sampledEventListener = new SampledEventListener();

    const socialContentProvider = new SocialContentProvider();
    const samplingFacade = SamplingFacade.getInstance();
    const postSocialContentListener = new PostSocialContentEventListener( socialContentProvider, samplingFacade );
    const periodicSocialPostingTimersHandler = PeriodicSocialPostingTimersHandler.getInstance();

    eventManager.addListener( EventsManager.ENUM.EVENTS.SAMPLED, sampledEventListener.getHandler() );
    eventManager.addListener( EventsManager.ENUM.EVENTS.USER_CONDITION, userConditionEventListener.getHandler() );
    eventManager.addListener( EventsManager.ENUM.EVENTS.POST_SAMPLE_SUMMARY, postSocialContentListener.getHandler() );

    periodicSocialPostingTimersHandler.fetch()
        .catch( (e) => console.warn( e ) );

    function exitHandler (exitCode) {
        console.log("Exit Handler:", exitCode );
        Promise.all([
            periodicSocialPostingTimersHandler.store(),
            samplingFacade.storeSamples()
        ])
            .finally( () => {
                console.log("exit");
                process.exit();
            })
    }

    // flush data when app is closing
    let signals = [
        "uncaughtException", //catches uncaught exceptions
        // 'SIGUSR2',
        'SIGHUP', //catches close console window event on Windows ( 10 seconds left to run code )
        'SIGINT', //catches ctrl+c event on Unix ( override default exit behaviour )
        'SIGTERM'
    ];

    if (process.platform === "win32") {
        // only way to catch ctr
        require("readline")
            .createInterface({
                input: process.stdin,
                output: process.stdout
            })
            .on("SIGINT", () => exitHandler( "SIGINT" ) );
    }
    signals.forEach( (sig) => process.on(sig, exitHandler ) );
}

module.exports = {
    init: init
}