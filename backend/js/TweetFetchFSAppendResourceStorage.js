const FSAppendResourceStorage = require("./FSAppendResourceStorage");
const api = require("./clients/2.0");

class TweetFetchFSAppendResourceStorage extends FSAppendResourceStorage{
    constructor() {
        super();
    }

    async store(resource) {
        return super.store(resource);
    }

    /**
     *
     * @param resource {AbstractStorableResource}
     * @return {Promise<void>}
     */
    async fetch(resource) {
        let data = await resource.fetch();
        let ids = data.map( item => item.id_str);


        return api.getTweets( ids )
            .catch( (cause) => {
                console.error( `${this.constructor.name}]`, "error occurred while fetch ids to twitter api", "cause:\n", cause );
            });
    }
}