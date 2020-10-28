const crypto = require('crypto');
const fs = require('fs');
const OAuth = require('oauth-1.0a');
const needle = require("needle");
const StatusCodes = require("http-status-codes").StatusCodes;
const qs = require('querystring');
const JSONStream = require('JSONStream');

class TwitterAPIController {
    static MAX_RESULT_PER_REQUEST = 100;
    static MAX_STREAMS_COUNT = 25;

    static ENUM = {
        SEARCH: {
            RECENT: {
                API: "https://api.twitter.com/2/tweets/search/recent"
            },
            STREAM: {
                API: "https://api.twitter.com/2/tweets/search/stream",
                RULES: {
                    API: "https://api.twitter.com/2/tweets/search/stream/rules"
                }
            }
        }
    };

    constructor() {
        this.activeStreams = [];
        this.pausedStreams = [];

        console.log( "[TwitterAPIController", "Fetching active stream rules ...");
        this.requestAPI("get", TwitterAPIController.ENUM.SEARCH.STREAM.RULES.API, null, null, true)
            .then( (apiResponse) => {
                if( apiResponse.statusCode == StatusCodes.OK ) {
                    if( Array.isArray( apiResponse.body.data ) ) {
                        apiResponse.body.data.forEach( (rule) => {
                            let sample = {
                                id: rule.id,
                                rule: { tag: rule.tag, value: rule.value },
                            }
                            this.activeStreams.push( sample );
                        });
                        console.log( "[TwitterAPIController", "Detected samples:", this.activeStreams );
                        this.startSampling();
                    }
                    else {
                        console.log( "[TwitterAPIController", "No active samples detected" );
                    }
                }
                else {
                    console.warn( "[TwitterAPIController", "Error fetching samples", "cause:", apiResponse.errors );
                }
            })
            .catch( (err) => {
                console.error( "[TwitterAPIController", "Error fetching samples", "cause:", err );
            })
    }

    getActiveSamples() {
        return this.activeStreams;
    }

    getPausedSamples() {
        return this.pausedStreams;
    }
    static getQueryFromFilter( filter ) {
        // TODO
        return filter;
    }

    getPausedSampleIndex(tag) {
        let samples = this.getPausedSamples();
        for (let i = 0; i < samples.length; i++) {
            if( samples[ i ].rule.tag == tag ) {
                return i;
            }
        }
        return -1;
    }

    getActiveSampleIndex(tag) {
        let samples = this.getActiveSamples();
        for (let i = 0; i < samples.length; i++) {
            if( samples[ i ].rule.tag == tag ) {
                return i;
            }
        }
        return -1;
    }

    getSample( tag ) {
        let index = this.getPausedSampleIndex( tag );
        if( index >= 0 ) {
            return this.getPausedSamples()[ index ];
        }
        else {
            index = this.getActiveSampleIndex( tag );
            if( index >= 0 ) {
                return this.getActiveSamples()[ index ];
            }
        }
        return null;
    }

    deleteSample( tag ) {
        let self = this;
        return new Promise( (resolve, reject) => {
            function handleDeleteSample(statusCode) {
                switch( statusCode ) {
                    case StatusCodes.OK:
                    case StatusCodes.METHOD_NOT_ALLOWED: {
                        let index = self.getPausedSampleIndex(tag);
                        if (index >= 0) {
                            self.pausedStreams.splice(index, 1);
                        }
                        resolve(StatusCodes.OK);
                        break;
                    }
                    default:
                        reject( statusCode );
                        break;
                }
            }

            this.pauseSample( tag )
                .then( handleDeleteSample )
                .catch( handleDeleteSample )
        });
    }

    addSample( tag, filter ) {
        let sample = this.getSample( tag );
        if( !sample ) {
            //stringify filter into query filter
            let queryFilter = TwitterAPIController.getQueryFromFilter( filter );
            sample = {
                id: null,
                rule: {
                    tag: tag,
                    value: queryFilter
                }
            }
            console.log( "Add new sample to paused streams", sample );
            this.getPausedSamples().push( sample );
            return this.resumeSample( tag );
        }
        else {
            return Promise.reject( StatusCodes.CONFLICT )
        }

    }

    resumeSample( tag ) {

        console.log( "[TwitterAPIController]", "Request of resume sample with tag ", `"${tag}"`);
        let activeSamples = this.getActiveSamples();
        let pausedSamples = this.getPausedSamples();

        if( activeSamples.length >= TwitterAPIController.MAX_STREAMS_COUNT ) {
            // should we using StatusCodes instead ?
            return Promise.reject( StatusCodes.TOO_MANY_REQUESTS );
        }

        let sampleIndex = this.getPausedSampleIndex( tag );

        if( sampleIndex >= 0 ) {
            let sample = pausedSamples[sampleIndex];

            console.log("resuming", sample);
            return new Promise( (resolve, reject) => {

                this.requestAPI(
                    "post",
                    TwitterAPIController.ENUM.SEARCH.STREAM.RULES.API,
                    null,
                    {
                        "add": [sample.rule]
                    }
                )
                    .then((apiResponse) => {
                        console.log("resumeSample response", apiResponse.statusCode, apiResponse.body);
                        // even if responds CREATED, the response content can contains errors
                        if (apiResponse.statusCode === StatusCodes.CREATED) {
                            if (apiResponse.body.meta.summary.valid) {
                                if (apiResponse.body.meta.summary.created) {

                                    sample.id = apiResponse.body.data[0].id;
                                    pausedSamples.splice(sampleIndex, 1);
                                    activeSamples.push(sample);

                                    resolve(StatusCodes.OK);
                                }
                                else if (apiResponse.body.meta.summary.not_created) {
                                    reject(StatusCodes.BAD_GATEWAY);
                                }
                            }
                            else {

                                if (apiResponse.body.errors[0].title == "DuplicateRule") {
                                    reject(StatusCodes.CONFLICT);
                                }
                                else {
                                    reject(StatusCodes.NOT_ACCEPTABLE);
                                }
                            }
                        }
                        else {
                            reject(StatusCodes.INTERNAL_SERVER_ERROR);
                        }
                    })
                    .catch((err) => {
                        console.error("[TwitterAPIController]", "resumeSample", "error:", err);
                        reject(StatusCodes.INTERNAL_SERVER_ERROR);
                    });
            });
        }
        else {
            sampleIndex = this.getActiveSampleIndex( tag );
            if( sampleIndex >= 0 ) {
                return Promise.resolve( StatusCodes.METHOD_NOT_ALLOWED );
            }
        }

        return Promise.reject( StatusCodes.NOT_FOUND );
    }


    startSampling() {
        let timeout = 0;
        let handlers = {
            // will be popolated below, justy here to reference "reconnect" function
        };

        let self = this;
        function timeoutHandler() {
            // Reconnect on error
            console.warn('A connection error occurred. Reconnecting…');
            setTimeout(
                () => { timeout++; self.streamConnect( handlers ); },
                2 ** timeout
            );
            self.streamConnect( handlers );
        }

        handlers.timeout = timeoutHandler;
        handlers.error = console.error;
        handlers.data = this.onStreamDataReceived;

        return self.streamConnect( handlers );
    }

    // https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
    streamConnect( handlers ) {
        //Listen to the stream
        let requestOptions = {
            timeout: 20000,
            accept : 'application/json'
        }
        let url = TwitterAPIController.ENUM.SEARCH.STREAM.API + "?tweet.fields=created_at&expansions=author_id&user.fields=created_at"

        requestOptions.headers = {
            "authorization": this.getAuthorizationHeader( url, true )
        };
        // let pip = fs.createWriteStream('data.json');
       let stream = needle.get( url, requestOptions );
       stream
           .pipe( JSONStream.parse() )
            .on('error', (error) => {
                if (error.code === 'ETIMEDOUT') {
                    stream.emit('timeout');
                }
                else {
                    if( "error" in handlers )
                        handlers[ "error" ]( error );
                }
            })
            .on('data', (data) => {
                // console.log( data.toString() );
                try {
                    if( "data" in handlers )
                        handlers[ "data" ]( data );
                }
                catch (e) {
                    if( "error" in handlers )
                        handlers[ "error" ]( e );
                    // Keep alive signal received. Do nothing.
                }
            })
            .on('timeout', handlers[ "timeout" ] );

        return stream;
    }

    onStreamDataReceived( data ) {
       console.log( "Received" ,  data );
    }

    pauseSample( tag ) {
        console.log( "[TwitterAPIController]", "Request of pause sample with tag ", `"${tag}"`);
        let sampleIndex = this.getActiveSampleIndex( tag );
        let activeSamples = this.getActiveSamples();
        let pausedSamples = this.getPausedSamples();

        if( sampleIndex >= 0 ) {
            let sample = activeSamples[ sampleIndex ];
            console.log("pausing", sample);
            return new Promise((resolve, reject) => {
                this.requestAPI("post", TwitterAPIController.ENUM.SEARCH.STREAM.RULES.API, null, {
                    delete: {
                        ids: [sample.id]
                    }
                })
                    .then((apiResponse) => {
                        console.log("pauseSample response", apiResponse.statusCode, apiResponse.body);
                        if (apiResponse.statusCode === StatusCodes.OK) {
                            if (apiResponse.body.meta.summary.deleted) {

                                sample.id = null;
                                activeSamples.splice(sampleIndex, 1);
                                pausedSamples.push(sample);

                                resolve(StatusCodes.OK);
                            }
                            else {
                                /*
                                    For some reason the sample can't be delete
                                */
                                /*
                                    this shouldn't never happen because the sample was in active stream
                                    but if we are here is because the sample was already been delete from API
                                    or the sample id doesn't match with remote API ID
                                 */
                                reject(StatusCodes.INTERNAL_SERVER_ERROR);
                            }
                        }
                    })
                    .catch((err) => {
                        console.error("[TwitterAPIController]", "pauseSample", "error:", err);
                        reject(StatusCodes.INTERNAL_SERVER_ERROR);
                    });
            });
        }
        else {
            sampleIndex = this.getPausedSampleIndex( tag );
            if( sampleIndex >= 0 ) {
                return Promise.resolve( StatusCodes.METHOD_NOT_ALLOWED );
            }
        }

        return Promise.reject( StatusCodes.NOT_FOUND );
    }

    getAuthorizationHeader( urlRequest, useBearer = true ) {
        if( useBearer ) {
            return `Bearer ${ process.env.TWITTER_API_BEARER_TOKEN }`;
        }
        else {
            let oauth = OAuth({
                consumer: {
                    key: process.env.TWITTER_API_CONSUMER_KEY,
                    secret: process.env.TWITTER_API_CONSUMER_SECRET
                },
                signature_method: 'HMAC-SHA1',
                hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
            });
            let oAuthAccessToken = {
                key: process.env.TWITTER_API_ACCESS_TOKEN,
                secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
            };
            let authHeader = oauth.toHeader(
                oauth.authorize({url: urlRequest, method: 'GET'},
                    oAuthAccessToken)
            );
            return authHeader["Authorization"];
        }
    }

    requestAPI(method, apiURL, params = null, body = null, shouldRequestAsBearer = true) {
        let requestOptions = {
            headers: {

            }
        };
        let endPointURL = apiURL;

        if( params ) {
            endPointURL += `?${qs.stringify(params)}`;
        }

        requestOptions.headers = {
            "authorization": this.getAuthorizationHeader( endPointURL, shouldRequestAsBearer )
        };

        if( body ) {
            requestOptions.headers[ "content-type" ] = "application/json";
        }

        return needle(
            method,
            endPointURL,
            body,
            requestOptions
        )
    }
}

const twitterAPIController = new TwitterAPIController();
module.exports = {
    instance: twitterAPIController,
    TwitterAPIController
};