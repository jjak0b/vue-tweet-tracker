const MyEventListener = require("./MyEventListener");
const WordMap = require("../WordMap");
const { spawn, Thread, Worker } = require( "threads" );

class PostSocialContentEventListener extends MyEventListener {

    /**
     *
     * @param contentProvider {SocialContentProvider}
     * @param facade {SamplingFacade}
     */
    constructor( contentProvider, facade ) {
        super();
        this.socialContentProvider = contentProvider
        this.samplerFacade = facade;
    }


    getHandler() {
        let self = this;

        /**
         * @param event {PostSocialContentEvent}
         */
        function handleEvent(event) {

            if( event.sampleTag ) {
                self.handlePostingSampleBased( event );
            }

        }
        return handleEvent;
    }

    /**
     *
     * @param event {PostSocialContentEvent}
     */
    handlePostingSampleBased(event ) {
        this.samplerFacade.getSampleItems(event.sampleTag)
            .then(
                /**
                 * @param items {Tweet[]}
                 */
                async (items) => {
                    /**
                     * heavy and could keep the main thread busy, so run it on worker
                     * @type {WordMap}
                     */
                    let wordMap;
                    let workerWordMap;
                    try {
                        workerWordMap = await spawn(
                            new Worker(
                                path.join( __dirname, "..", "workers", "WordMapWorker")
                            )
                        );
                        /**
                         * heavy and could keep the main thread busy, so run it on worker
                         * @type {WordMap}
                         */
                        wordMap = await workerWordMap.createAndUpdate( items, (item) => item.data.text );
                        let status = `Here there is the updated word-cloud related to "${event.sampleTag}"`;
                        await this.socialContentProvider.publishWordCloud( status, wordMap);
                    }
                    catch (e) {
                        console.error(`[${this.constructor.name}:handlePostingSampleBased]`, `Unable to publish Word Cloud status of sample "${event.sampleTag}"`, "reason:\n", error );
                    }
                    finally {
                        // items can be a lot so dispose them and let the garbage collector do stuff
                        if( wordMap ) {
                            wordMap.dispose();
                            wordMap = null;
                        }
                        if( workerWordMap )
                            Thread.terminate(workerWordMap).catch( (e) => console.error(`[${this.constructor.name}:handlePostingSampleBased]`, `Error while Terminate worker, reason:\n`, e ) );
                    }
                }
            )
            .catch( (e) => {
                console.error( `[${this.constructor.name}]`, `the sample tag "${event.sampleTag}" doesn't exist, ignoring posting based on sample tag, code:`, e );
            })
    }
}

module.exports = PostSocialContentEventListener;