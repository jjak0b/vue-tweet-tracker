const TimersHandler = require("../../timers/TimersHandler");
const EventsManager = require("../../sampling/services/EventsManager");
const PostSocialContentEvent = require("../../events/PostSocialContentEvent");
const path = require("path");

class PeriodicSocialPostingTimersHandler extends TimersHandler {
    constructor() {
        super(path.join(global.__basedir || "", "plannedPosting.json" ), []);
    }

    /**
     * @type PeriodicSocialPostingTimersHandler
     */
    static instance;

    /**
     *
     * @return {PeriodicSocialPostingTimersHandler}
     */
    static getInstance() {
        if( !this.instance ) {
            this.instance = new PeriodicSocialPostingTimersHandler();
        }
        return this.instance;
    }

    startTimer( timer ) {
        timer.run(
            () => {
                EventsManager.getInstance().emit(
                    EventsManager.ENUM.EVENTS.POST_SAMPLE_SUMMARY,
                    new PostSocialContentEvent(
                        "Planned post:" + JSON.stringify( timer ),
                        timer.getName()
                    )
                );
            },
            () => {
                this.deleteTimer( timer.name );
            }
        );
    }
}

module.exports = PeriodicSocialPostingTimersHandler;