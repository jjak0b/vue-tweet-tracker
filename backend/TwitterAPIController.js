const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const needle = require("needle");
const qs = require('querystring');

class TwitterAPIController {
    static MAX_RESULT_PER_REQUEST = 100;

    static API_ROUTES = {
        "SEARCH": {
            "RECENT": "https://api.twitter.com/2/tweets/search/recent"
        }
    };

    constructor() {

    }

    static GetAuthorizationHeader( urlRequest, useBearer = true ) {
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

    static request( method, apiURL, params = {}, body = null, shouldRequestAsBearer = true ) {
        let endPointURL = `${apiURL}?${ qs.stringify( params ) }`;
        return needle(
            method,
            endPointURL,
            {
                headers: {
                    authorization: TwitterAPIController.GetAuthorizationHeader( endPointURL, shouldRequestAsBearer )
                },
                body: body
            }
        )
    }
}

module.exports = TwitterAPIController;