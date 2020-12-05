class Timer {
    constructor(start, end, day, hour, minute){  //dates in ISOString, period in DD:HH:MM
        this.startTime = start;
        this.endTime = end;
        this.day = day;
        this.hours = hour;
        this.minutes = minute;
    }

    getStartTime(){
        return this.startTime;
    }
    getEndTime(){
        return this.endTime;
    }
    getPeriod(){
        return this.getPeriodInMs();
    }
    getPeriodInMs(){
        return this.minutes * 60000 + this.hours * 3600000 + this.day * 86400000;
    }
}