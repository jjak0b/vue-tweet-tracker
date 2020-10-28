const StatusCodes = require("http-status-codes").StatusCodes;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const TwitterAPIController = require( "../TwitterAPIController").TwitterAPIController;
const twitterAPIControllerInstance = require( "../TwitterAPIController").instance;

router.get( "/", API_getSamples );
/**
 * Get samples list in some states
 * @API GET /samples/
 * @query states: "active" , "paused" or a string that contains both; will consider both if not specified
 * @StatusCodes: StatusCodes.OK
 * @Body : (in function of "states" parameter ) { active: array of sample tag, paused: array of sample tag }
 *
 */
function API_getSamples( req, res ) {
    // TODO: return list of samples tags
    let statesQuery = req.query.states;

    let data = {};
    if( !statesQuery || statesQuery.length < 1 || statesQuery.includes( "active" ) ) {
        data.active = twitterAPIControllerInstance.getActiveSamples().map(sample => sample.rule.tag );
    }
    if( !statesQuery || statesQuery.length < 1 || statesQuery.includes( "paused" ) ) {
        data.paused = twitterAPIControllerInstance.getPausedSamples().map(sample => sample.rule.tag );;
    }
   res.json( data );
}

router.get( "/:tag", API_getSampleData );
/**
 * Get sample' tweets
 * @API GET /samples/:tag
 * @query N/A
 * @StatusCodes N/A
 * @Body N/A
 *
 */
function API_getSampleData( req, res ) {
    // TODO: return sample' tweets
}

router.put( "/:tag", API_addSample );
/**
 * Add but not replace the specified sample of request's body
 * @API PUT /samples/:tag
 * @query N/A
 * ## StatusCodes: StatusCodes
 * - StatusCode.OK
 * - StatusCodes.TOO_MANY_REQUESTS if a sample is paused, but the current number of requests has been reached and can't set to active
 * - StatusCodes.CONFLICT if a sample with the same tag or same filter configuration already exists
 * - StatusCodes of POST /samples/:tag/resume
 *
 */
function API_addSample(req, res) {
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

}

router.delete( "/:tag", API_deleteSample );
/**
 * Delete the specified sample
 * @API DELETE /samples/:tag
 * @query N/A
 * ## StatusCodes: StatusCodes
 * - StatusCode.OK
 * - StatusCodes of POST /samples/:tag/pause except StatusCodes.METHOD_NOT_ALLOWED
 *
 */
function API_deleteSample( req, res ) {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.deleteSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })
}

router.post( "/:tag/resume", API_resumeSample );
/**
 * Resume the sample from "paused" state to "active" state and resume sampling
 * @API POST /samples/:tag/resume
 * @query N/A
 * ## StatusCodes: StatusCodes
 * - StatusCode.OK
 * - StatusCodes.METHOD_NOT_ALLOWED : The sample is already in active state so the state doesn't change
 * - StatusCodes.NOT_FOUND if the sample can't be found
 * - StatusCodes.NOT_ACCEPTABLE if the filter is not valid
 * - StatusCodes.CONFLICT if the sample was in paused state but it can't be set to "active" state because another sample with same filter rule is in "active" state ( duplicated fitler rule )
 * - StatusCodes.BAD_GATEWAY : the twitter api responded in unexpected way
 *
 */
function API_resumeSample( req, res ) {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.resumeSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })

}

router.post( "/:tag/pause", API_pauseSample );
/**
 * Pause the sample from "active" state to "paused" state and stop sampling
 * @API POST /samples/:tag/resume
 * @query N/A
 * ## StatusCodes: StatusCodes
 * - StatusCode.OK
 * - StatusCodes.METHOD_NOT_ALLOWED : The sample is already in paused state so the state doesn't change
 * - StatusCodes.NOT_FOUND if the sample can't be found
 * - StatusCodes.NOT_ACCEPTABLE if the filter is not valid
 */
function API_pauseSample( req, res ) {
    let sampleTag = req.params.tag;

    twitterAPIControllerInstance.pauseSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })
}

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