class ItemsCollection {

    constructor( collection ) {
        /**
         * @type {[]}
         */
        this.cache = collection || [];
    }

    /**
     * Used to be overridden and provide utility to fetch and add to this collection any items in any way
     * @returns {Promise<*>}
     */
    fetch() {
        return Promise.resolve()
    }

    /**
     * @Brief Add item to collection
     * @param data
     * @returns {Promise<void>}
     */
    add( data ) {
        return Promise.resolve();
    }

    /**
     * @Brief clear items buffer
     * @returns {Promise<void>}
     */
    flush() {
        this.cache.splice( 0, this.cache.length );
        return Promise.resolve();
    }

    /**
     *
     * @returns {Promise<[]>}
     */
    toArray() {
        return Promise.resolve( this.cache );
    }
}

module.exports = ItemsCollection;