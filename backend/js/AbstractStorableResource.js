class AbstractStorableResource {
    constructor( location ) {
        this.location = location;
        /**
         *
         * @type {IResourceStorage}
         */
        this.storage = null;
    }

    setStorage( /*IResourceStorage*/ storage ) {
        this.storage = storage;
    }

    /**
     *
     * @return {Promise<*>}
     */
    async fetch() {
        if( this.storage ) {
            console.log(`[${this.constructor.name}]`, "Fetching", this.getLocation() );
            let response = await this.storage.fetch(this);
            console.log(`[${this.constructor.name}]`, "Fetched", this.getLocation() );
            return response;
        }

        console.warn(`[${this.constructor.name}]`, "Attempting to fetch without a storage set for instance:", this );
        return null;
    }

    async store() {
        if( this.storage ) {
            console.log(`[${this.constructor.name}]`, "Storing", this.getLocation() );
            let response = await this.storage.store(this);
            console.log(`[${this.constructor.name}]`, "Stored", this.getLocation() );
            return response;
        }

        console.warn(`[${this.constructor.name}]`, "Attempting to store without a storage set for instance:", this );
        return null;
    }

    async onFetch( value ){
        console.error(`[${this.constructor.name}]`, "calling onFetch interface of", AbstractStorableResource.name );
        return value;
    }

    async erase() {
        return this.storage.erase( this );
    }

    /**
     * @return *
     */
    async onStore(){
        console.error(`[${this.constructor.name}]`, "calling onStore interface of", AbstractStorableResource.name );
        return null;
    }


    getLocation() {
        return this.location;
    }

    setLocation(location) {
        this.location = location;
    }
}

module.exports = AbstractStorableResource;