class IResourceStorage {
    constructor() {

    }

    /**
     *
     * @param resource {AbstractStorableResource}
     * @return {Promise<void>}
     */
    async fetch( resource ){}

    /**
     *
     * @param resource {AbstractStorableResource}
     * @return {Promise<void>}
     */
    async store( resource ){}

    /**
     *
     * @param resource {AbstractStorableResource}
     * @return {Promise<void>}
     */
    async erase( resource ){}
}

module.exports = IResourceStorage;