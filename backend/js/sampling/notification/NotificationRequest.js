
class NotificationRequest {
    constructor(/*Message*/message) {
        this.message = message;
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