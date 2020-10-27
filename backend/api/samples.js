const StatusCodes = require("http-status-codes").StatusCodes;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const TwitterAPIController = require( "../TwitterAPIController").TwitterAPIController;
const twitterAPIControllerInstance = require( "../TwitterAPIController").instance;

router.get( "/", (req, res) => {
    // TODO: return list of samples

});

router.get( "/:tag", (req, res) => {
    // TODO: return sample' tweets
});

router.put( "/:tag", (req, res) => {
    let sampleTag = req.params.tag;

    let filter = "cat has:images"; // this should be an object, i use this for testing

    twitterAPIControllerInstance.addSample( sampleTag, filter );
});

router.delete( "/:tag", (req, res) => {
    let sampleTag = req.params.tag;

    // TODO: remove sample from any sample list
});

router.post( "/:tag/resume", (req, res) => {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.resumeSample( sampleTag );
});

router.post( "/:tag/pause", (req, res) => {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.pauseSample( sampleTag );
});

// https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/master/Filtered-Stream/filtered_stream.js
function streamConnect() {
    //Listen to the stream
    const options = {
        timeout: 20000
    }
    const stream = twitterAPIControllerInstance.request(
        "get",
        TwitterAPIController.ENUM.SEARCH.STREAM.API,
        null,
        {
            add: [ rule ]
        },
        true
    );

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