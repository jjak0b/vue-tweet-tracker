const SampleItemsCollection = require("./ItemsCollection");

class ItemsCollectionStorage extends SampleItemsCollection {

    constructor( /*String*/path, /*Array*/collection = null ) {
        super(collection);
        this.countMax = 100;
        this.path = path;
    }

    /**
     *
     * @returns {Promise<[]>}
     */
    fetch() {
        // just for debugging
        const shouldGetPlainText = false;

        return new Promise( ( resolve, reject ) => {
            fs.readFile(
                this.path,
                {encoding: "utf-8"},
                (err, dataBuffer) => {
                    if( err ) {
                        reject( err );
                        return;
                    }

                    dataBuffer = dataBuffer.replace (/^/,'[');
                    if( this.count > 0 ) {
                        // remove last comma ",\n"
                        dataBuffer += dataBuffer.substring(0,dataBuffer.length - 2);
                    }
                    dataBuffer += "]";
                    if( shouldGetPlainText ) {
                        resolve( dataBuffer );
                    }
                    else {
                        try {
                            let parsed = JSON.parse( dataBuffer.toString() );
                            resolve( parsed );
                        }
                        catch (e) {
                            reject( e );
                        }
                    }
                }
            );
        });
    }

    /**
     * @Brief Add item to collection and store to trigger the file storing if the cache items count reach the .countMax prop
     * @param data
     * @returns {Promise<unknown>}
     */
    add( data ) {
        return new Promise( ( resolve) => {
            super.add( data )
                .finally( () => {
                    // try to flush if we reach max count
                    if( this.cache.length >= this.countMax ) {
                        this.flush()
                            .catch( err => console.error("ItemsCollectionStorage", "Unable to flush cache", "reason:", err ) )
                    }
                    resolve();
                });
        });
    }


    /**
     * @Brief store cached items into file
     * @returns {Promise<void>}
     */
    flush() {
        let cache = super.toArray();

        if( cache.length > 0 ) {
            let json = "";
            cache.forEach( item => {
                // add ",\n" as postfix so it's close to a valid json
                json += `${JSON.stringify( item )},\n`;
            });

            return new Promise( ( resolve, reject ) => {
                fs.appendFile(
                    this.path,
                    json,
                    {encoding: "utf-8"}
                )
                    .then( resolve )
                    .catch( reject );
            });
        }
        else {
            return Promise.resolve();
        }
    }

    toArray() {
        return new Promise( (resolve) => {
            this.fetch()
                .then( (storedItems) => {
                    super.toArray()
                        .then( (cache) => {
                            resolve( storedItems.concat( cache ) );
                        })
                })
                .catch( () => {
                    // just provide cache
                    resolve( super.toArray() );
                });
        })
    }
}

module.exports = ItemsCollectionStorage;