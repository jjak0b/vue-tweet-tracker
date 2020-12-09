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

    async function exitHandler (exitCode) {
        let promises = [];
        promises.push( samplingFacade.storeSamples() );
        promises.push( periodicSocialPostingTimersHandler.store() );

        let i = 0;
        for( const promise of promises ) {
            try {
                await promise;
            }
            catch (e) {
                console.error( "[System]", "Error while flushing promise ", i, "reason:\n", e );
            }
            i++;
        }

        if (exitCode || exitCode === 0)
            console.log(exitCode);
        process.exit();
    }

    // flush data when app is closing
    [
        "uncaughtException", //catches uncaught exceptions
        // "exit",// when process.exit has been called
        'SIGUSR1', // catches "kill pid" (for example: nodemon restart)
        'SIGUSR2',
        // 'SIGHUP',
        'SIGINT',//catches ctrl+c event
        // 'SIGQUIT',
        // 'SIGILL',
        // 'SIGTRAP',
        // 'SIGABRT',
        // 'SIGBUS',
        // 'SIGFPE',
        // 'SIGSEGV',
        // 'SIGTERM'
    ].forEach( (sig) => process.on(sig, exitHandler ) );
}



module.exports = {
    init: init
}