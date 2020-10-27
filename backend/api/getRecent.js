const StatusCodes = require("http-status-codes").StatusCodes;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const TwitterAPIController = require( "../TwitterAPIController").TwitterAPIController;
const twitterAPIControllerInstance = require( "../TwitterAPIController").instance;

router.get( "/:query", (req, res) => {

    // Make the request
    let params = {            // request parameters
        query: req.params.query,

        max_results: TwitterAPIController.MAX_RESULT_PER_REQUEST,
        expansions: [
            "author_id",
            "geo.place_id",
        ].join(),
        "tweet.fields": [
            "id",
            "lang",
            "text",
            "possibly_sensitive",
            "context_annotations",
            "geo"
        ].join(),
        "place.fields": [
            "id",
            "full_name",
            "name",
            "country_code",
            "country",
            "geo",
            "contained_within",
            "place_type" /* city | poi */
        ].join(),
        "user.fields": [
            "name",
            "location",
            "created_at"
         ].join()
    };

    twitterAPIControllerInstance.request("get", TwitterAPIController.ENUM.SEARCH.RECENT.API, params )
        .then( (apiResponse) => {
            res.setHeader("content-type'", "application/json");
            res.write(
                JSON.stringify( apiResponse.body, null, 4 ),
                apiResponse.headers.charset
            );

            res.end();
        })
        .catch( (err) => {
            console.error(err);
            res.status( StatusCodes.INTERNAL_SERVER_ERROR );
        });
});

async function saveData(data){  //funzione per salvare i dati ottenuti in un file json
    let jsondata = JSON.stringify(data, null, 4)
    fs.writeFileSync('../tweets.json', jsondata, (err) =>{
        if (err) throw err;
    })
}

module.exports = router;