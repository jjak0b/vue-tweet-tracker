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

    async fetch(/*AbstractResource*/resource) {
        let data = await fs.readFile(
            resource.getLocation(),
            { encoding: "utf-8" },
        );
        return resource.onFetch( data );
    }

    async store(/*AbstractResource*/resource) {
        let data = await resource.onStore();

        return fs.outputFile(
            resource.getLocation(),
            data,
            {
                flag: "+",
                encoding: "utf-8"
            },
        );
    }
}

module.exports = FSResourceStorage;