class Timer {
    constructor(tag,filter){
        this.startTime = filter.posting.from.date;
        this.endTime = filter.posting.to.date;
        this.day = filter.posting.frequency.days;
        this.hours = filter.posting.frequency.hours;
        this.minutes = filter.posting.frequency.minutes;
        this.name = tag;
        this.interval = {};
    }

    getName(){
        return this.name;
    }
    getStartTime(){
        return this.startTime.getTime();
    }
    getEndTime(){
        return this.endTime.getTime();
    }
    getPeriod(){
        return this.getPeriodInMs();
    }
    getPeriodInMs(){
        return this.minutes * 60000 + this.hours * 3600000 + this.day * 86400000;
    }
    getIntervalValue(){
        return this.interval;
    }
    setIntervalValue(interval){
        this.interval = interval;
    }
}