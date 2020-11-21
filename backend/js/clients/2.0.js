const Twitter = require("twitter-v2");

const clientAppContext = new Twitter( {
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET
});

module.exports = {
    clientAppContext: clientAppContext
}