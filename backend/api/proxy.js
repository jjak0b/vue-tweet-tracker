const StatusCodes = require("http-status-codes").StatusCodes;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const qs = require("query-string");
const twitterAPIControllerInstance = require( "../js/sampling/controllers/ContextSamplingController");

router.all( "/:version", (req, res) => {

    let query = req.query;
    let url = `https://api.twitter.com/${req.params.version}/${query.api}`;

    let params = null;
    let useBearer = false;
    let count = 15;

    let version = req.params.version;
    if( version == "2") {
        useBearer = true;
        params = {        // request parameters
            // so ne
            query: req.query.q,
            max_results: count
        };
    }
    else {
        useBearer = false;
        params = {        // request parameters
            // so ne
            q: query.q,
            max_results: count
        };
        delete query.api;
        delete query.q;
        params = Object.assign( params, query);
    }
    console.log("Proxing to", version, url );

    twitterAPIControllerInstance.requestAPI(req.method, url, params, null, useBearer )
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

module.exports = router;
