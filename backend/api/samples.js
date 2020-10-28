const StatusCodes = require("http-status-codes").StatusCodes;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const TwitterAPIController = require( "../TwitterAPIController").TwitterAPIController;
const twitterAPIControllerInstance = require( "../TwitterAPIController").instance;

router.get( "/", (req, res) => {
    // TODO: return list of samples
    let statesQuery = req.query.states;

    let data = {};
    if( !statesQuery || statesQuery.length < 1 || statesQuery.includes( "active" ) ) {
        data.active = twitterAPIControllerInstance.getActiveSamples();
    }
    if( !statesQuery || statesQuery.length < 1 || statesQuery.includes( "paused" ) ) {
        data.paused = twitterAPIControllerInstance.getPausedSamples();
    }
   res.json( data );
});

router.get( "/:tag", (req, res) => {
    // TODO: return sample' tweets
})

router.put( "/:tag", (req, res) => {
    let sampleTag = req.params.tag;

    console.log( "received", sampleTag );
    let filter = "dog has:images"; // this should be an object, i use this for testing

    let promise = twitterAPIControllerInstance.addSample( sampleTag, filter )
    promise
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })

});

router.delete( "/:tag", (req, res) => {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.deleteSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })
});

router.post( "/:tag/resume", (req, res) => {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.resumeSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })

});

router.post( "/:tag/pause", (req, res) => {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.pauseSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })
});

// https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
function streamConnect() {
    //Listen to the stream
    const options = {
        timeout: 20000
    }
    const stream = twitterAPIControllerInstance.requestAPI("get", TwitterAPIController.ENUM.SEARCH.STREAM.API, null, {
        add: [rule]
    }, true);

    stream
        .on('data', data => {
            try {
                const json = JSON.parse(data);
                console.log(json);
            }
            catch (e) {
                // Keep alive signal received. Do nothing.
            }
        })
        .on('error', error => {
            if (error.code === 'ETIMEDOUT') {
                stream.emit('timeout');
            }
        });

    return stream;
}
module.exports = router;