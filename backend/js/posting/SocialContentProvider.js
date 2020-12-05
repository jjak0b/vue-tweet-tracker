const TwitterSocialPostingService = require("./services/TwitterSocialPostingService");
const SocialPostingHandler = require("./handlers/SocialPostingHandler");
const WordCloudImageDirector = require("./directors/WordCloudImageDirector");
const WordCloudImageBuilder = require("./builders/WordCloudImageBuilder");

class SocialContentProvider {
    constructor() {

        this.startHandler = new SocialPostingHandler(
            new TwitterSocialPostingService()
        )

        // add new services using
        // this.startHandler.setNextHandler(
        //     new SocialPostingHandler(
        //         new ISocialPostingService()
        //     )
        // )

    }

    /**
     *
     * @param status
     * @param wordMap {WordMap}
     * @return {Promise<*[] | Number>}
     */
    async publishWordCloud(status, wordMap ) {
        let wordCloudBuilder = new WordCloudImageBuilder();
        let wordCloudDirector = new WordCloudImageDirector( wordCloudBuilder );

        try {
            await wordCloudDirector.construct(wordMap, 1280, 720);

            let imageMedia = wordCloudBuilder.getResult();

            let postingPromises = this.startHandler.handlePosting(
                status,
                [
                    imageMedia
                ]
            );
            return Promise.all( postingPromises );
        }
        catch (e) {
            return Promise.reject( e );
        }
    }
}

module.exports = SocialContentProvider;