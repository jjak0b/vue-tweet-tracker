const crypto = require('crypto');
const fs = require('fs');
const OAuth = require('oauth-1.0a');
const needle = require("needle");
const StatusCodes = require("http-status-codes").StatusCodes;
const qs = require('query-string');
const JSONStream = require('JSONStream');
const Tweet = require( "../../sampleItems/Tweet" );
const Sample = require( "../../Sample" );
const FilterConverter = require( "../../filterConverter");
const SamplingController = require("./SamplingController");
const FilterBuilder = require("../filters/FilterBuilder");
const SampleBuilder = require("../../SampleBuilder");
const GeocodedFilter = require("../filters/GeocodedFilter");

class ContextSamplingController extends SamplingController {
    static MAX_RESULT_PER_REQUEST = 100;
    static MAX_STREAMS_COUNT = 25;

    static ENUM = {
        SEARCH: {
            RECENT: {
                API: "https://api.twitter.com/2/tweets/search/recent"
                // API: "https://api.twitter.com/1.1/search/tweets.json" // 1.1
            },
            STREAM: {
                API: "https://api.twitter.com/2/tweets/search/stream",
                RULES: {
                    API: "https://api.twitter.com/2/tweets/search/stream/rules"
                }
            }
        }
    };

    static PARAMETERS = {
        expansions: [
            "author_id",
            "geo.place_id",
        ].join(),
        "tweet.fields": [
            "geo",
            "public_metrics",
            "lang",
            "text",
            "possibly_sensitive",
            "context_annotations",
            "entities"
        ].join(),
        "place.fields": [
            "id",
            "geo",
            "place_type", /* city | poi */
            "full_name",
            "country_code",
            "country",
            "contained_within"
        ].join(),
        "user.fields": [
            "name",
            "location",
            "created_at"
        ].join()
    };

    constructor(eventManager) {
        super(eventManager);

        this.isSampling = false;
        this.activeStreams = [];
        this.pausedStreams = [];

        console.log( "[ContextSamplingController", "Fetching active stream rules ...");
        this.requestAPI("get", ContextSamplingController.ENUM.SEARCH.STREAM.RULES.API, null, null, true)
            .then( (apiResponse) => {
                if( apiResponse.statusCode === StatusCodes.OK ) {
                    if( Array.isArray( apiResponse.body.data ) && apiResponse.body.data.length > 0 ) {
                        apiResponse.body.data.forEach( (rule) => {
                            let sample = new Sample( rule.id,  { tag: rule.tag, value: rule.value } );
                            this.activeStreams.push( sample );
                        });
                        console.log( "[ContextSamplingController", "Detected samples:", this.activeStreams );
                        this.start();
                    }
                    else {
                        console.log( "[ContextSamplingController", "No active samples detected" );
                    }
                }
                else {
                    console.warn( "[ContextSamplingController", "Error fetching samples", "cause:", apiResponse.errors );
                }
            })
            .catch( (err) => {
                console.error( "[ContextSamplingController", "Error fetching samples", "cause:", err );
            })
    }

    getActiveSamples() {
        return this.activeStreams;
    }

    getPausedSamples() {
        return this.pausedStreams;
    }
    static getQueryFromFilter( filter ) {
        return FilterConverter.convertfilter( filter );
    }

    getPausedSampleIndex(tag) {
        let samples = this.getPausedSamples();
        for (let i = 0; i < samples.length; i++) {
            if( samples[ i ].rule.tag === tag ) {
                return i;
            }
        }
        return -1;
    }

    getActiveSampleIndex(tag) {
        let samples = this.getActiveSamples();
        for (let i = 0; i < samples.length; i++) {
            if( samples[ i ].rule.tag === tag ) {
                return i;
            }
        }
        return -1;
    }

    get(tag ) {
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

    remove(tag ) {
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

            this.pause( tag )
                .then( handleDeleteSample )
                .catch( handleDeleteSample )
        });
    }

    add(tag, filter ) {
        let sample = this.get( tag );
        if( !sample ) {
            filter = new FilterBuilder.build( filter );
            //stringify filter into query filter
            let queryFilter = ContextSamplingController.getQueryFromFilter( filter );
            let sample = SampleBuilder.build(
                tag,
                new GeocodedFilter( filter )
            );
            console.log( "Add new sample to paused streams", sample );
            this.getPausedSamples().push( sample );
            return this.resume( tag );
        }
        else {
            return Promise.reject( StatusCodes.CONFLICT )
        }

    }

    resume(tag ) {

        console.log( "[ContextSamplingController]", "Request of resume sample with tag ", `"${tag}"`);
        let activeSamples = this.getActiveSamples();
        let pausedSamples = this.getPausedSamples();

        if( activeSamples.length >= ContextSamplingController.MAX_STREAMS_COUNT ) {
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
                    ContextSamplingController.ENUM.SEARCH.STREAM.RULES.API,
                    null,
                    {
                        "add": [sample.rule]
                    }
                )
                    .then((apiResponse) => {
                        console.log("resume response", apiResponse.statusCode, apiResponse.body);
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

                                if( !this.isSampling ) {
                                    this.start();
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
                        console.error("[ContextSamplingController]", "resume", "error:", err);
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


    start() {
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
        handlers.data = this.onStreamDataReceived.bind( self );

        this.isSampling = true;
        return self.streamConnect( handlers );
    }

    // https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
    streamConnect( handlers ) {
        //Listen to the stream
        let params = ContextSamplingController.PARAMETERS;

        let endPointURL = ContextSamplingController.ENUM.SEARCH.STREAM.API;
        if( params ) {
            endPointURL += `?${qs.stringify(params)}`;
        }

        let requestOptions = {
            timeout: 20000,
            accept : 'application/json',
            headers: {
                "authorization": this.getAuthorizationHeader( endPointURL, true )
            }
        }

        // let pip = fs.createWriteStream('data.json');
       let stream = needle.get( endPointURL, requestOptions );
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
        let destinations = data.matching_rules;
        data.matching_rules = null;
        this.routesDataToSamples(data, destinations );
    }

    routesDataToSamples( dataToAssign, destinationRules) {
        for (let i = 0; i < destinationRules.length; i++) {

            let tweet = new Tweet( dataToAssign );
            let tag = destinationRules[ i ].tag;
            // console.log( "Received data" , tweet, "for", tag );
            let sampleIndex = this.getActiveSampleIndex( tag );
            if( sampleIndex >= 0 ) {
                let sample = this.getActiveSamples()[ sampleIndex ];

                sample.add( tweet );
            }
            else {
                // ley us know if something doesn't behave like it should
                console.error( "[TwitterAPIControlle:routesDataToSamples]", `Unable to find route for "${tag}" sample in active samples`, "So the data has been ignores");
            }
        }
    }

    pause(tag ) {
        console.log( "[ContextSamplingController]", "Request of pause sample with tag ", `"${tag}"`);
        let sampleIndex = this.getActiveSampleIndex( tag );
        let activeSamples = this.getActiveSamples();
        let pausedSamples = this.getPausedSamples();

        if( sampleIndex >= 0 ) {
            let sample = activeSamples[ sampleIndex ];
            console.log("pausing", sample);
            return new Promise((resolve, reject) => {
                this.requestAPI("post", ContextSamplingController.ENUM.SEARCH.STREAM.RULES.API, null, {
                    delete: {
                        ids: [sample.id]
                    }
                })
                    .then((apiResponse) => {
                        console.log("pause response", apiResponse.statusCode, apiResponse.body);
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
                        console.error("[ContextSamplingController]", "pause", "error:", err);
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
            let paramsQuery = qs.stringify(params);
            endPointURL += `?${paramsQuery}`;
        }

        console.log( endPointURL );
        requestOptions.headers = {
            "authorization": this.getAuthorizationHeader(  endPointURL, shouldRequestAsBearer )
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

const twitterAPIController = new ContextSamplingController();
module.exports = ContextSamplingController