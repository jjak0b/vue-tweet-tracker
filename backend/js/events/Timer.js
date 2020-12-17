class Timer {
    constructor(tag, data ){
        this.startTime = new Date( `${data.from.date}T${data.from.time}`  );
        this.endTime = new Date( `${data.to.date}T${data.to.time}` );
        this.days =  Number.parseInt( "" + data.frequency.days ) || 0;
        this.hours = Number.parseInt( "" + data.frequency.hours  ) || 0;
        this.minutes = Number.parseInt( "" + data.frequency.minutes ) || ( ( !this.days && !this.hours ) ? 1 : 0  );
        this.name = tag;

        this.intervalHandler = null;
        this.timeoutHandler = null;
    }

    toJSON() {
        return {
            name: this.name,
            startTime: this.startTime,
            endTime: this.endTime,
            days: this.days,
            hours: this.hours,
            minutes: this.minutes
        }
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
        return this.minutes * 60000 + this.hours * 3600000 + this.days * 86400000;
    }

    /**
     *
     * @param startCallback {Function}
     * @param endCallback {Function}
     */
    run( startCallback, endCallback ) {

        let now = Date.now();
        if( now >= this.getEndTime() ) {
            console.log( `[${this.constructor.name}] Time difference`, this.endTime.toString(), new Date( now ).toString(), this.getEndTime() - now );
            return
        }

        let waitStartTime = this.getStartTime() - now;
        waitStartTime = waitStartTime > 0 ? waitStartTime : 0;
        console.log( `[${this.constructor.name}] Waiting`, waitStartTime, "for", this.getName() );
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

module.exports = Timer;