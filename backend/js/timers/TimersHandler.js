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
        await super.fetch();
        let items = this.getItems();
        items.forEach( (item, index, array) => {
            Object.setPrototypeOf( array[index], Timer.prototype );
            /**
             * @type {Timer}
             */
            let timer = array[ index ];
            timer.startTime.from.date = new Date( timer.startTime.from.date );
            timer.endTime.to.date = new Date( timer.startTime.to.date );
            this.startTimer( timer );
        });
        return items;
    }

    /**
     *
     * @param timer {Timer}
     */
    startTimer( timer ) {
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