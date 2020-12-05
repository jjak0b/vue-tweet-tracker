const ISocialPostingService = require("./ISocialPostingService");

const uploadClient = require("../../clients/1.1").getUserContextClient("upload");
const postClient = require("../../clients/1.1").getUserContextClient("api");

class TwitterSocialPostingService extends ISocialPostingService{
    constructor() {
        super();
        this.client = {
            uploading:  uploadClient,
            posting: postClient
        }
    }


    async addPublicPost(text, media) {

        let mediaIds = [];
        for (let i = 0; i < media.length; i++) {
            let mediaInfo = media[ i ];
            try {
                let media_id = await this.uploadMedia(mediaInfo);
                mediaIds.push( media_id );
            }
            catch (e) {
                console.error( `[${this.constructor.name}]`, "Error uploading media", mediaInfo.mime, mediaInfo.metaInfo, "cause:\n", e );
            }
        }

        try {
            return await this.client.posting.post(
                "/statuses/update",
                {
                    status: text,
                    media_ids: mediaIds
                }
            )
        }
        catch (e) {
            console.error( `[${this.constructor.name}]`, "Error posting status", text, "cause:\n", e );
            return e
        }


    }

    /**
     *
     * @param media {MediaInfo}
     *
     */
    async uploadMedia( media) {
        let mediaCategory = null;
        if( media.mime.includes("image") ) {
            if( media.mime.includes("gif") ) {
                mediaCategory = "TweetGif";
            }
            else {
                mediaCategory = "TweetImage";
            }
        }
        else if( media.mime.includes("video") ) {
            mediaCategory = "TweetVideo";
        }
        else {
            console.warn( `[${this.constructor.name}]`, "Warning: attempting to upload unhandled media", media.mime );
        }

        let response = await this.client.uploading.post(
            "media/upload",
            {
                media_data: media.data.toString("base64"),
                media_type: media.mime,
                media_category: mediaCategory
            }
        )

        return response[ "media_id_string" ];
    }
}

module.exports = TwitterSocialPostingService;