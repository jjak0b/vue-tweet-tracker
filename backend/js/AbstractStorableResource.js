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
        return this.storage.fetch( this );
    }

    async store() {
        return this.storage.store( this ) ;
    }

    async onFetch( value ){}

    /**
     * @return *
     */
    async onStore(){}


    getLocation() {
        return this.location;
    }
}

module.exports = AbstractStorableResource;