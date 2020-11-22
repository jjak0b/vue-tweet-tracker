class NotificationRequest {
    constructor(/*Message*/message, tag) {
        this.message = tag + '\n' + message;
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