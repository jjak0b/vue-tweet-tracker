class Timer {
    constructor(tag, data ){
        this.startTime = data.from.date;
        this.endTime = data.to.date;
        this.day = data.frequency.days;
        this.hours = data.frequency.hours;
        this.minutes = data.frequency.minutes;
        this.name = tag;
        this.intervalHandler = null;
        this.timeoutHandler = null;
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

    /**
     *
     * @param startCallback {Function}
     * @param endCallback {Function}
     */
    run( startCallback, endCallback ) {
        let now = Date.now();
        if( now >= this.getEndTime() ) {
            return
        }

        let waitStartTime = this.getStartTime() - now;
        waitStartTime = waitStartTime > 0 ? waitStartTime : 0;

        this.timeoutHandler = setTimeout(
            () => {
                now = Date.now();
                let waitEndTime = this.getEndTime() - now;
                waitEndTime = waitEndTime > 0 ? waitEndTime : 0;

                this.timeoutHandler = setTimeout(
                    () => this.end( endCallback ),
                    waitEndTime
                );

                this.start( startCallback );
            },
            waitStartTime
        );
    }

    start( periodicCallback ) {
        if( periodicCallback ) {
            periodicCallback();
        }
        this.intervalHandler = setInterval(
            () => {
                if( periodicCallback ) periodicCallback();
            },
            this.getPeriod()
        )
    }

    end( endCallback ) {
        if( this.intervalHandler ) {
            clearInterval( this.intervalHandler );
            this.intervalHandler = null;
        }
        if( this.timeoutHandler ) {
            clearTimeout( this.timeoutHandler );
            this.timeoutHandler = null;
        }

        if( endCallback ) endCallback();
    }
}