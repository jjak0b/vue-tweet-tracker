const EventsManager = require('/backend/js/sampling/services/EventsManager');
const PostSocialContentEvent = require('/backend/js/events/PostSocialContentEvent');
const ItemCollection = require('../../ItemsCollection');
const FSResourceStorage = require('../../FSResourceStorage')
const Timer = require('../events/Timer')

class TimerListener {
    constructor() {
        this.interval = {}
        this.timer = new ItemCollection("timer.json", [], 128);
        this.timer.setStorage(FSResourceStorage.getInstance())

        this.timer.fetch()
            .then( () => {
                this.timer.getItems().forEach((item,index,array) => Object.setPrototypeOf(array[index], Timer));
            })
    }
    handleEvent(){
        let start = this.timer.getItems().getStartTime();
        let end = this.timer.getItems().getEndTime();
        let now = new Date();
        if(now.getTime() == start){
            let period = this.timer.getItems().getPeriod();
            this.startTimer(period)
        }
        else if(now.getTime() > start && now.getTime() < end){
            let time = now.getTime() - start; //get the actual time passed 'til now
            let fixedPeriod = this.timer.getItems().getPeriod() - time; //time of first timer
            this.startFixedTimer(fixedPeriod,this.timer.getItems().getPeriod()); //start first timer with fixed period
        }
        else if(now.getTime() > end){
            this.stopTimer();
        }
        else if(end == null || start == null){
            return "no period specified"
        }
    }

    startTimer(period){
        /**
         *
         * @param period {number}
         */
        this.interval = setInterval(EventsManager.getInstance().emit(EventsManager.ENUM.EVENTS.POST_SAMPLE_SUMMARY,
            new PostSocialContentEvent(this.timer.getItems().getName(),null)), period);
        this.timer.getItems().setIntervalValue(this.interval)
    }

    startFixedTimer(fixedPeriod, period){ //execute one time with fixedPeriod and after that start with normal period
        /**
         * @param fixedPeriod {number}
         * @param period {number}
         */
        setTimeout(()=>{
            EventsManager.getInstance().emit(EventsManager.ENUM.EVENTS.POST_SAMPLE_SUMMARY,
                new PostSocialContentEvent(this.timer.getItems().getName(),null));
            this.startTimer(period);
        }, fixedPeriod);
    }

    stopTimer(){
        /**
         * @param interval {interval}
         * interval is the return value of setInterval function
         */
        this.interval = this.timer.getItems().getIntervalValue()
        clearInterval(this.interval);
    }

}
