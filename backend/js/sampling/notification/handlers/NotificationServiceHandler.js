class NotificationServiceHandler {
    constructor( /*NotificationService*/service ) {
        this.nextHandler = null;
        this.service = service;
    }

    setNextHandler(handler) {
        this.nextHandler =  handler;
    }

    /**
     *
     * @returns {NotificationService}
     */
    getService() {
        return this.service;
    }

    handleRequest( /*NotificationRequest*/request) {
        if( this.nextHandler ) {
            return this.nextHandler.handleRequest( request );
        }
        else {
            return null;
        }
    }
}

module.exports = NotificationServiceHandler;