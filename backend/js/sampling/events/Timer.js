class Timer {
    constructor(start, end, period){  //dates in ISOString, period in DD:HH:MM
        this.startTime = start;
        this.endTime = end;
        this.period = period;
    }

    getStartTime(){
        return this.startTime;
    }
    getEndTime(){
        return this.endTime;
    }
    getPeriod(){
        return this.period;
    }
    getPeriodInMs(){
        //TODO
    }
    periodToString(){
        return
    }
}