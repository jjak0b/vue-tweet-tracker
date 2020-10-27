const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const needle = require("needle");
const StatusCodes = require("http-status-codes").StatusCodes;
const qs = require('querystring');

class TwitterAPIController {
    static MAX_RESULT_PER_REQUEST = 100;
    static MAX_STREAMS_COUNT = 25;

    static ENUM = {
        SEARCH: {
            RECENT: {
                API: "https://api.twitter.com/2/tweets/search/recent"
            },
            STREAM: {
                API: "https://api.twitter.com/2/tweets/search/stream"
            }
        }
    };

    constructor() {
        this.activeStreams = [];
        this.pausedStreams = [];
    }

    getActiveStreams() {
        return this.activeStreams;
    }

    static getQueryFromFilter( filter ) {
        // TODO
        return filter;
    }

    addSample( tag, filter ) {

        //stringify filter into query filter
        let queryFilter = TwitterAPIController.getQueryFromFilter( filter );

        let sample = {
            id: null,
            rule: {
                tag: tag,
                value: queryFilter
            }
        }

        this.pausedStreams.push( sample );

        return this.resumeSample( tag );
    }

    resumeSample( tag ) {
        let sampleIndex = -1;

        if( this.activeStreams.length >= TwitterAPIController.MAX_STREAMS_COUNT ) {
            // should we using StatusCodes instead ?
            return Promise.reject( TwitterAPIController.MAX_STREAMS_COUNT );
        }

        for (let i = 0; i < this.pausedStreams.length; i++) {
            if( this.pausedStreams[ i ].rule.tag == tag ) {
                sampleIndex = i;
                break;
            }
        }

        if( sampleIndex > 0 ) {
            let sample = this.pausedStreams[ sampleIndex ];
            return this.request(
                "post",
                TwitterAPIController.ENUM.SEARCH.STREAM.API,
                null,
                {
                    add: [ sample.rule ]
                }
            )
                .then( (apiResponse) => {
                    if( apiResponse.statusCode == StatusCodes.CREATED ) {
                        sample.id = apiResponse.body.data[ 0 ].id;
                        this.pausedStreams.splice( sampleIndex, 1 );
                        this.activeStreams.push( sample );
                    }
                })
                .catch( (err) => {

                });
        }

        return null;
    }

    pauseSample( tag ) {
        let sampleIndex = -1;

        for (let i = 0; i < this.activeStreams.length; i++) {
            if( this.activeStreams[ i ].rule.tag == tag ) {
                sampleIndex = i;
                break;
            }
        }

        if( sampleIndex > 0 ) {
            let sample = this.activeStreams[ sampleIndex ];
            this.request(
                "post",
                TwitterAPIController.ENUM.SEARCH.STREAM.API,
                null,
                {
                    delete: {
                        ids: [ sample.id ]
                    }
                }
            )
                .then( (apiResponse) => {
                    if( apiResponse.statusCode == StatusCodes.Ok ) {
                        sample.id = null;
                        this.activeStreams.splice( sampleIndex, 1 );
                        this.pausedStreams.push( sample );
                    }
                })
                .catch( (err) => {

                });
        }
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

    request( method, apiURL, params = null, body = null, shouldRequestAsBearer = true ) {
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