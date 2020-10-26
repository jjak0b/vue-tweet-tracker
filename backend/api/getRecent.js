const express = require('express');
const router = express.Router();
const fs = require('fs');
const needle = require('needle');
// const crypto = require('crypto');

const API_searchRecent = 'https://api.twitter.com/2/tweets/search/recent';
let auto20 = {
    "authorization": `Bearer ${ process.env.TWITTER_API_BEARER_TOKEN }`
};

/*
// va verificare
https://developer.twitter.com/en/docs/authentication/oauth-1-0a/creating-a-signature

let now = Date.now();
let nonce = now;
let signature_method = "HMAC-SHA1";
let signingKey = `${encodeURIComponent(process.env.TWITTER_API_CONSUMER_SECRET)}&${encodeURIComponent(process.env.TWITTER_API_ACCESS_TOKEN_SECRET)}`;
let signature = crypto.createHash(signature_method, signingKey);

var hmac = crypto.createHmac(signature_method, signingKey).update(signingKey).digest('binary');;

let auto10a = {
    "authorization" : "OAuth " +
        `oauth_consumer_key="${process.env.TWITTER_API_CONSUMER_KEY}"` + ",\n" +
        `oauth_token="${process.env.TWITTER_API_ACCESS_TOKEN}"` + ",\n" +
        `oauth_signature="${signature}"` + ",\n" +
        `oauth_signature_method="${ signature_method }"` + ",\n" +
        `oauth_timestamp="${now}"` + ",\n" +
        `oauth_nonce="${nonce}"` + ",\n" +
        `oauth_version="${"1.0"}"` + ",\n";

}
*/

let auth = auto20;


router.get( "/:query", (req, res) => {
    const params = {            //parametri della richiesta
        query: req.params.query,
        max_results: 100,
        expansions: [
            //"author_id",
            "geo.place_id",
        ].join(),
        "tweet.fields": [
            "id",
            "text",
            "author_id",
            "created_at",
            "possibly_sensitive",
            "geo",
        ].join(),
        "place.fields": [
            "id",
            "full_name",
            "name",
            "country_code",
            "geo",
            "contained_within",
            "place_type" /* city | poi */
        ].join(),
       /* 'user.fields': [
            "name",
            "created_at"
        ].join()*/
    }

    needle(
        'get',
        API_searchRecent,
        params,
        {
            headers: auth
        }
    )
        .then( (data) => {
            res.write( JSON.stringify( data.body, null, 4 ) );
            res.end();
        })
        .catch( (err) => {
            console.error(err);
        });
});

async function saveData(data){  //funzione per salvare i dati ottenuti in un file json
    let jsondata = JSON.stringify(data, null, 4)
    fs.writeFileSync('../tweets.json', jsondata, (err) =>{
        if (err) throw err;
    })
}

module.exports = router;