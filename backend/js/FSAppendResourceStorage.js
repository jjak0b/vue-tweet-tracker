const fs = require("fs-extra");
const FSResourceStorage = require("./FSResourceStorage");

class FSAppendResourceStorage extends FSResourceStorage  {
    /**
     * @type {FSResourceStorage}
     */
    static instance ;
    constructor() {
        super();
    }

    static getInstance() {
        if( !this.instance ) {
            this.instance = new FSAppendResourceStorage();
        }
        return this.instance;
    }

    async store(resource) {
        let data = await resource.onStore();
        return await fs.outputFile(
            resource.getLocation(),
            data,
            {
                flag: "a+", // append and create file if it doesn't exists
                encoding: "utf-8"
            }
        )
    }
}

module.exports = FSAppendResourceStorage;