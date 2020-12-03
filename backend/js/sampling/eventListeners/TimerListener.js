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
            //TODO
        }
        else if(now.toISOString() > end){
            this.stopTimer(this.interval);
        }
    }

    startTimer(period){
        this.interval = setInterval(/*post function*/publishPost(post), period);
    }

    stopTimer(interval){
        clearInterval(interval);
    }

}
