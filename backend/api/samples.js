const express = require('express');
const router = express.Router();
const SamplingFacade = require("../js/SamplingFacade");
const samplingFacade = SamplingFacade.getInstance();
const periodicSocialPostingTimersHandler = require("../js/posting/handlers/PeriodicSocialPostingTimersHandler").getInstance();
router.get( "/", API_getSamples );
/**
 * Get samples list in some states
 * @API GET /samples/
 * @StatusCodes: StatusCodes.OK
 * @Body : { active: array of sample tag, paused: array of sample tag }
 *
 */
function API_getSamples( req, res ) {

    let data = samplingFacade.getSamplesStates();
    res.json( Object.fromEntries( data ) );
}

router.get( "/:tag", API_getSampleData );
/**
 * Get sample' tweets
 * @API GET /samples/:tag
 * @query N/A
 * @StatusCodes N/A
 * @Body JSON Array of tweets for the sample tag provided
 *
 */
async function API_getSampleData( req, res ) {
    let tag = req.params.tag;



            try {
                let items = await samplingFacade.getSampleItems(tag);
                res.json( items );
            }
            catch(err) {
                res.sendStatus(err);
            }
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
 * @body: require the filter into the request's body
 */
function API_addSample(req, res) {
    let sampleTag = req.params.tag;
    let filter = req.body;

        samplingFacade.addSample( sampleTag, filter )
            .then( (statusCode) => {
                if( filter.posting ) {
                    let timer = new Timer( filter.posting );
                    periodicSocialPostingTimersHandler.add( timer );
                }

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



        samplingFacade.deleteSample( sampleTag )
        .then( (statusCode) => {
            periodicSocialPostingTimersHandler.deleteTimer( sampleTag );
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

        samplingFacade.resumeSample( sampleTag )
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

        samplingFacade.pauseSample( sampleTag )
        .then( (statusCode) => {
            res.sendStatus( statusCode );
        })
        .catch( (errCode) => {
            res.sendStatus( errCode );
        })
}

module.exports = router;