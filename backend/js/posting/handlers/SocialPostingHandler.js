class SocialPostingHandler {
    /**
     *
     * @param service {ISocialPostingService}
     */
    constructor( service ) {
        /**
         *
         * @type {SocialPostingHandler}
         */
        this.nextHandler = null;
        this.service = service;
    }

    /**
     *
     * @param handler {SocialPostingHandler}
     */
    setNextHandler( handler ) {
        this.nextHandler = handler;
    }

    /**
     *
     * @param status {String}
     * @param media {MediaInfo[]}
     * @return {Promise[]}
     */
    handlePosting( status, media) {
        let promises = [];
        promises.push( this.service.addPublicPost( status, media ) );
        if( this.nextHandler ) {
            promises = promises.concat(
                this.nextHandler.handlePosting(status, media)
            );
        }
        return promises;
    }

}

module.exports = SocialPostingHandler;