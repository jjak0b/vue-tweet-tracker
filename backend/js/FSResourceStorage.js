const IResourceStorage = require("./IResourceStorage");
const fs = require("fs-extra");

class FSResourceStorage extends IResourceStorage  {
    /**
     * @type {FSResourceStorage}
     */
    static instance ;
    constructor() {
        super();
    }

    static getInstance() {
        if( !this.instance ) {
            this.instance = new FSResourceStorage();
        }
        return this.instance;
    }

    async fetch(/*AbstractStorableResource*/resource) {
        let data = await fs.readFile(
            resource.getLocation(),
            { encoding: "utf-8" },
        );
        return resource.onFetch( data );
    }

    async store(/*AbstractStorableResource*/resource) {
        let data = await resource.onStore();

        if( data ) {
            return fs.outputFile(
                resource.getLocation(),
                data,
                {
                    encoding: "utf-8"
                }
            );
        }
        else {
            return Promise.reject(null);
        }
    }
}

module.exports = FSResourceStorage;