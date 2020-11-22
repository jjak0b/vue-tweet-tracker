const Twitter = require("twitter-lite");

const clientAppContext = new Twitter( {
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET
});

const clientUserContext = new Twitter({
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET, // from Twitter.
    access_token_key: process.env.TWITTER_API_ACCESS_TOKEN, // from your User (oauth_token)
    access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET, // from your User (oauth_token_secret)
});

module.exports = {
    clientAppContext: clientAppContext,
    clientUserContext: clientUserContext
}