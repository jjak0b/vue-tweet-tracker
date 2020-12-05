const system = require('/backend/js/system')
const EventsManager = require("/backend/js/sampling/services/EventsManager");
const PostSocialContentEventListener = require("backend/js/eventListeners/PostSocialContentEventListener");

class TimerListener {
    constructor() {
        this.interval = {}
    }
    handleEvent(Timer){
        let start = Timer.getStartTime();
        let end = Timer.getEndTime();
        let now = new Date();
        if(now.toISOString() == start){
            this.startTimer(Timer.getPeriod())
        }
        else if(now.toISOString() > start && now.toISOString() < end){
            let time = now.getTime() - start.getTime(); //get the actual time passed 'til now
            let fixedPeriod = Timer.getPeriod() - time; //time of first timer
            this.startFixedTimer(fixedPeriod,Timer.getPeriod()); //start first timer with fixed period
        }
        else if(now.toISOString() > end){
            this.stopTimer(this.interval);
        }
    }

    startTimer(period){
        this.interval = setInterval(/*placeholder*/ publishPost(post), period);
    }

    startFixedTimer(fixedPeriod, period){ //execute one time with fixedPeriod and after that start with normal period
        setTimeout(()=>{
            publishPost(post);  //placeholder
            this.startTimer(period);
        }, fixedPeriod);
    }

    stopTimer(interval){
        clearInterval(interval);
    }

}
