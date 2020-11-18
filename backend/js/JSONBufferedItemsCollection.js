const ItemsCollection = require("./ItemsCollection");
const FSAppendResourceStorage = require("./FSAppendResourceStorage");

class JSONBufferedItemsCollection extends ItemsCollection {

    constructor( /*String*/path, /*Array*/collection, size = 128 ) {
        super(path, collection);
        this.size = size;
        this.setStorage( FSAppendResourceStorage.getInstance() );
    }

    /**
     * Used to be overridden and provide utility to fetch and add to this collection any items in any way
     * @returns {Promise<*>}
     */
    async fetch() {
        return await super.fetch();
    }

    /**
     * @Brief store and clear items buffer
     * @returns {Promise<void>}
     */
    async store() {
        await super.store();
        let buffer = await super.toArray();
        buffer.splice( 0, buffer.length );
    }

    /**
     * @return {Promise<*[]>}
     */
    async onFetch ( data ) {
        // remove last comma ",\n"
        data = `[${ data.length > 0 ? data.substring(0, data.length - 2) : "" }]`;
        return JSON.parse( data );
    }

    async onStore() {
        let cache = await super.toArray();
        let json = "";
        if( cache.length > 0 ) {
            cache.forEach(item => {
                // add ",\n" as postfix so it's close to a valid json
                json += `${JSON.stringify(item)},\n`;
            });
        }
        return json;
    }

    /**
     * @Brief Add item to collection and store to trigger the file storing if the buffer items count reach the .size prop
     * @param item
     * @returns {Promise<unknown>}
     */
    async add( item ) {
        await super.add( item );
        // try to store if we reach max count
        let cache = await super.toArray();
        if( cache.length >= this.size ) {
            return this.store();
        }
    }

    async toArray() {
        let cache = await super.toArray();
        try {
            let storedItems = await this.fetch();
            return storedItems.concat( cache );
        }
        catch (e) {
            // just provide buffer
            return cache;
        }
    }
}

module.exports = JSONBufferedItemsCollection;