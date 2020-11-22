const JSONBufferedItemsCollection = require("./JSONBufferedItemsCollection");
const path = require("path");
const ItemsCollection = require("./ItemsCollection");

class ProxyJSONBufferedItemsCollection extends JSONBufferedItemsCollection{
    constructor(
        /*String*/location,
        /*Array*/collection,
        size
    ) {
        super(
            /*String*/location,
            /*Array*/collection,
            size
        );

        this.tempCollection = new ItemsCollection( path.join( path.dirname( location ), `temp_${path.basename( location )}` ) );
        // this.setStorage( FSAppendResourceStorage.getInstance() );
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
    }

}