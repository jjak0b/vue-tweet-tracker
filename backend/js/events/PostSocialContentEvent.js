const MyEvent = require("./MyEvent");

class PostSocialContentEvent extends MyEvent {

    /**
     *
     * @param postMetaInfo {String}
     * @param sampleTag {String}
     */
    constructor(postMetaInfo, sampleTag) {
        super(PostSocialContentEvent.name, null );
        this.sampleTag = sampleTag;
    }
}

module.exports = PostSocialContentEvent;