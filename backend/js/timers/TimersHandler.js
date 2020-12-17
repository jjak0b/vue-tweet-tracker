const ItemsCollection = require('../ItemsCollection');
const FSResourceStorage = require("../FSResourceStorage");
const EventsManager = require("../sampling/services/EventsManager");
const Timer = require("../events/Timer");

class TimersHandler extends ItemsCollection {
    constructor( location, initCollection) {
        super( location, initCollection );
        this.setStorage(FSResourceStorage.getInstance());
    }


    /**
     *
     * @param timer {Timer}
     * @return {Promise<void>}
     */
    async add(timer) {
        if( !this.getTimer( timer.name ) ) {
            await super.add( timer );
            this.startTimer( timer );
        }
    }

    /**
     *
     * @param name {String}
     */
    deleteTimer( name ) {
        console.log(`[${this.constructor.name}] deleting timer`, name );
        let timer = this.getTimer( name );
        if( timer ) {
            this.stopTimer( timer );
            let index = this.getItems().indexOf( timer );
            this.getItems().splice( index, 1 );
        }
    }

    /**
     *
     * @param name
     * @return {Timer|null}
     */
    getTimer( name ) {
        let items = this.getItems()
            .filter( (timer) => timer.name === name );
        return items.length > 0 ? items[ 0 ] : null;
    }

    async fetch() {
        try {
            await super.fetch();
        }
        catch ( e ) {
            if( e.code === "ENOENT" ) {
                console.log(`[${this.constructor.name}]`, "Init timers" );
            }
            else {
                console.error(`[${this.constructor.name}]`, `Error reading local ${this.getLocation()}, "reason:`, e);
            }
        }

        let items = this.getItems();
        items.forEach( (item, index, array) => {
            Object.setPrototypeOf( array[index], Timer.prototype );
            /**
             * @type {Timer}
             */
            let timer = array[ index ];
            timer.startTime = new Date( timer.startTime );
            timer.endTime = new Date( timer.endTime );
            this.startTimer( timer );
        });
        return items;
    }

    async store() {
        try {
            return super.store();
        }
        catch ( e ) {
            console.error( `[${this.constructor.name}]`, "Error writing local", this.getLocation(), "reason:", e );
            return Promise.reject( e );
        }
    }

    /**
     *
     * @param timer {Timer}
     */
    startTimer( timer ) {
        console.log( `[${this.constructor.name}] starting timer for`, timer.getName() );
        timer.run(
            () => {
                EventsManager.getInstance().emit(  EventsManager.ENUM.EVENTS.TIMER_TICK, timer );
            },
            () => {
                this.deleteTimer( timer.name );
            }
        );
    }

    /**
     *
     * @param timer {Timer}
     */
    stopTimer( timer ) {
        timer.end();
    }

}

module.exports = TimersHandler;