class IResourceStorage {
    constructor() {

    }

    /**
     *
     * @param resource
     * @return {Promise<void>}
     */
    async fetch( /*AbstractStorableResource*/ resource ){};

    /**
     *
     * @param resource
     * @return {Promise<void>}
     */
    async store( /*AbstractStorableResource*/ resource ){}
}

module.exports = IResourceStorage;