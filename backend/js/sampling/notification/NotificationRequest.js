class NotificationRequest {
    constructor(/*Message*/message, tag) {
        this.message = message;
        this.tag = tag;
    }

    /**
     *
     * @returns {Message}
     */
    getMessage() {
        return this.message;
    }
}

module.exports = NotificationRequest;