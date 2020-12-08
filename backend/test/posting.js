const assert = require('assert');
const {StatusCodes} = require( "http-status-codes" );
const path = require("path");
const WordMap = require("../js/WordMap");
const { spawn, Thread, Worker } = require( "threads" );
require('dotenv').config( {
    path: path.join( __dirname, "..", "..", ".env" )
});

const WordCloudImageBuilder = require("../js/posting/builders/WordCloudImageBuilder");
const WordCloudImageDirector = require("../js/posting/directors/WordCloudImageDirector");
const SocialPostingHandler = require("../js/posting/handlers/SocialPostingHandler");
const TwitterSocialPostingService = require("../js/posting/services/TwitterSocialPostingService");
const SocialContentProvider = require("../js/posting/SocialContentProvider");

let workerWordMap = null;
/**
 * @type {WordMap}
 */
let wordMap = null;
let imageWordCloud = null;
let publishPostText = " Hello World this is a test checked using #mochajs @ https://mochajs.org to create and publish a word cloud\n Am I a test ?!?!; (count,me)\n Hello. /\t\r\n/ \\, Here there is my link${{$£!!!!:https://www.youtube.com/watch?v=SkgTxQm9DWM\n I/know/this is a weird test /()\t"

describe( "Test Word Cloud posting", function () {

    let textMap = new Map( [
        [
            "Hello",
            {
                "count": 2
            }
        ],
        [
            "World",
            {
                "count": 1
            }
        ],
        [
            "this",
            {
                "count": 2
            }
        ],
        [
            "is",
            {
                "count": 3
            }
        ],
        [
            "a",
            {
                "count": 4
            }
        ],
        [
            "test",
            {
                "count": 3
            }
        ],
        [
            "checked",
            {
                "count": 1
            }
        ],
        [
            "using",
            {
                "count": 1
            }
        ],
        [
            "mochajs",
            {
                "count": 1
            }
        ],
        [
            "to",
            {
                "count": 1
            }
        ],
        [
            "create",
            {
                "count": 1
            }
        ],
        [
            "and",
            {
                "count": 1
            }
        ],
        [
            "publish",
            {
                "count": 1
            }
        ],
        [
            "word",
            {
                "count": 1
            }
        ],
        [
            "cloud",
            {
                "count": 1
            }
        ],
        [
            "Am",
            {
                "count": 1
            }
        ],
        [
            "I",
            {
                "count": 2
            }
        ],
        [
            "count",
            {
                "count": 1
            }
        ],
        [
            "me",
            {
                "count": 1
            }
        ],
        [
            "Here",
            {
                "count": 1
            }
        ],
        [
            "there",
            {
                "count": 1
            }
        ],
        [
            "my",
            {
                "count": 1
            }
        ],
        [
            "link",
            {
                "count": 1
            }
        ],
        [
            "know",
            {
                "count": 1
            }
        ],
        [
            "weird",
            {
                "count": 1
            }
        ]
    ]);

    describe('Create and run WordMap worker', function() {
        const wordCount = 25;
        describe( "Creating worker", function () {
            it('should spawn Worker', async function() {
                workerWordMap = await spawn(
                    new Worker(
                        path.join("..", "js", "workers", "WordMapWorker")
                    )
                );
                assert.notStrictEqual( workerWordMap, null );
            });
        })
        describe( "Filtering Words", function () {
            describe('#createAndUpdate', function() {
                it(`should return a key-value WordMap with ${wordCount} words`, async function()  {
                    wordMap = await workerWordMap.createAndUpdate( [ publishPostText ], null );
                    assert.strictEqual(
                        wordMap.size,
                        wordCount,
                        `Instead are ${wordMap.size}\n ${ JSON.stringify( Array.from( wordMap.entries() ), null, 4 ) }`
                    );
                    assert.strictEqual(
                        JSON.stringify( Array.from( wordMap.entries() ), null, 4 ),
                        JSON.stringify( Array.from( textMap.entries() ), null, 4 )
                    );
                });
            });
        })
    });

    describe( "Create Word Cloud Image", function () {
        let wordCloudBuilder = null,
            wordCloudDirector = null;

        describe( "Construct WordCloud", function () {
            wordCloudBuilder = new WordCloudImageBuilder();
            wordCloudDirector = new WordCloudImageDirector( wordCloudBuilder );
            it( "should construct Image without errors", async function () {
                await wordCloudDirector.construct(wordMap, 1280, 720);
                /**
                 * @type {MediaInfo}
                 */
                imageWordCloud = wordCloudBuilder.getResult();
                assert.strictEqual( !!imageWordCloud, true, "Image media not defined");
            });
        });
    })


    describe( "Test Publish WordCloud", function () {
        let twitterHandler = null;

        describe( "Instancing Twitter SocialPostingHandler", function () {
            twitterHandler = new SocialPostingHandler(
                new TwitterSocialPostingService()
            )

             let checkStatus = (response) => {

                assert.notStrictEqual( response, undefined, "Undefined response");
                assert.strictEqual( response.errors, undefined, "Errors Occurred:" + response.errors );
                assert.notStrictEqual( response._headers, undefined, "Undefined response headers");
                /**
                 * @type String
                 */
                let status = response._headers.get( "status" );
                assert.notStrictEqual( status, undefined, "Undefined status");
                assert.strictEqual( status.length > 0, true );
                let statusCode = Number.parseInt( status.split(" ")[ 0 ] );
                assert.strictEqual( statusCode, StatusCodes.OK );
            }

            describe( "TwitterPostingHandler", function () {
                this.timeout(5000);
                it( "#handlePosting", function (done) {
                    assert.notStrictEqual( imageWordCloud, null, "WorCloud Media not defined");
                    let promises = twitterHandler.handlePosting(publishPostText, [ imageWordCloud ] );
                    promises[0]
                        .then( function (response) {
                            checkStatus(response);
                            done();
                        })
                        .catch( function (reason) {
                            checkStatus(reason);
                            done();
                        })
                })
            });

            describe( "Post to all registered social media ", function () {
                this.timeout(5000);
                it( "should return responses with no error", async function () {
                    let socialProvider = new SocialContentProvider();
                    let responses = await socialProvider.publishWordCloud(publishPostText, wordMap )
                    assert.strictEqual( responses.length > 0, true );
                    checkStatus( responses[ 0 ] );
                });
            })

        })
    })
})
    .afterAll( function () {
        Thread.terminate( workerWordMap );
    });