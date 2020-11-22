const Twitter = require("twitter-v2");

const clientAppContext = new Twitter( {
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET
});

const PARAMETERS = {
    expansions: [
        "author_id",
        "geo.place_id",
        "attachments.media_keys",
    ].join(),
    "tweet.fields": [
        "geo",
        "public_metrics",
        "lang",
        "text",
        "possibly_sensitive",
        "context_annotations",
        "entities",
        "created_at"
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
    ].join(),
    "media.fields": [
        "type",
        "url", // to use with photo
        "preview_image_url", // to use with videos
        "media_key",
        "public_metrics"
    ].join()
};

module.exports = {
    clientAppContext: clientAppContext,
    getTweets: async function( ids ) { return clientAppContext.get("tweets", Object.assign({ ids: ids }, PARAMETERS ) ) },
    getStream: async function() { return clientAppContext.stream( "tweets/search/stream", PARAMETERS ) }
}