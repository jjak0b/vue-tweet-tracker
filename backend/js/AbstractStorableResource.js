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

    async fetch() {
        if( this.storage )
            return this.storage.fetch( this );

        console.warn(`[${this.constructor.name}]`, "Attempting to fetch without a storage set for instance:", this );
        return null;
    }

    async store() {
        if( this.storage )
            return this.storage.store( this ) ;

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