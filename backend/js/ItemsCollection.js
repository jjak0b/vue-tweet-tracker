const AbstractStorableResource = require("./AbstractStorableResource");

class ItemsCollection extends AbstractStorableResource {
    constructor( location, collection ) {
        super( location );

        /**
         * @type {[]}
         */
        this.buffer = collection || [];
    }

    /**
     * @return {*[]}
     */
    async onFetch( data ) {
        this.buffer = JSON.parse( data );
        return this.buffer;
    }

    /**
     * @return {Promise<String>}
     */
    async onStore() {
        return JSON.stringify(this.buffer);
    }


    /**
     * @Brief Add item to collection
     * @param item
     * @returns {Promise<void>}
     */
    async add( item ) {
        this.buffer.push( item );
    }

    /**
     *
     * @returns {Promise<[]>}
     */
    async toArray() {
        return this.buffer;
    }
}

module.exports = ItemsCollection;