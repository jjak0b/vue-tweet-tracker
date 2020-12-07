const assert = require('assert');
require('dotenv').config();
const {StatusCodes} = require( "http-status-codes" );
const userPostingClient = require("../js/clients/1.1").getUserContextClient("api");
const client = require("needle");


// change this if needed
let httpProtocol = "http";
let host = "localhost";
let samples_API_URL = `${httpProtocol}://${host}:${process.env.PORT}/api/samples`;

async function awaitTimeout( time ) {
    return new Promise( (resolve) => {
       setTimeout( resolve, time );
    });
}

async function publishSomeTweets( texts ) {
    let ids = [];
    for await (const text of texts) {
        let response = await userPostingClient.post(
            "/statuses/update",
            {
                status: text,
            }
        )
        console.log( response );
        ids.push( response.id_str );
    }
    return ids;
}

function checkStatusIDS( sampleItems, statusIds ){
    let ok = true;
    for (const sampleItem of sampleItems) ok = ok && statusIds.some( (id) => id === sampleItem.id );
    return true;
}

describe( "Test sampling API" , function () {

    let today = new Date().toISOString().slice(0, 10);
    let tests = new Map([
        [
            "valid",
            {
                sampleName: "Basic Test",
                sample: {
                    words: {
                        exact: ["test " + today],
                    }
                }
            }
        ],
        [
            "invalid",
            {
                sampleName: "Invalid and not created Test",
                sample: {
                    words: {
                        language: "en" // not allowed by twitter API if there is not other "main" operators
                    }
                }
            }
        ]
    ]);

    tests.set(
        "duplicate_name",
        {
            sampleName: tests.get("valid").sampleName,
            sample: {
                words: {
                    any: ["test", today],
                    exact: ["test " + today],
                }
            }
        }
    );

    tests.set(
        "duplicate_filter",
        {
            sampleName: "Duplicated filter Test",
            sample: tests.get("valid").sample
        }
    );

    let config = {json: true};

    describe("cleanup samples", function () {
        tests.forEach((test, testType) => {
            let url = `${samples_API_URL}/${test.sampleName}`;
            it(`clear samples used for test "${testType}"`, function () {
                return client.request("DELETE", url, null, config)
            });
        })
    });

    describe("basic full API test", async function () {
        describe( "Add sample", function () {

            tests.forEach((test, testType) => {
                describe("Test type:" + testType, function () {
                    let url = `${samples_API_URL}/${test.sampleName}`;
                    describe(`Add a sample "${test.sampleName}"`, function () {
                        let responseCallback;

                        switch (testType) {
                            case "valid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.CREATED);
                                }
                                break;
                            case "invalid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.NOT_ACCEPTABLE);
                                }
                                break;
                            case "duplicate_name":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.CONFLICT);
                                }
                                break;
                            case "duplicate_filter":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.CREATED);
                                }
                                break;
                        }

                        it(`PUT ${url}`, function (done) {
                            client.request("PUT", url, test.sample, config, function (err, response) {
                                if (responseCallback) {
                                    responseCallback.bind(this);
                                    responseCallback(err, response);
                                }
                                done();
                            })
                        });
                    });
                });
            });
        });
        describe( "Resume sample", function () {

            tests.forEach((test, testType) => {
                describe("Test type:" + testType, function () {
                    let url = `${samples_API_URL}/${test.sampleName}/resume`;
                    describe(`Resume a sample "${test.sampleName}"`, function () {
                        let responseCallback;

                        switch (testType) {
                            case "valid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.OK);
                                }
                                break;
                            case "invalid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.NOT_FOUND);
                                }
                                break;
                            // "duplicate_name" sample have same tag of "valid" so can't be resumed and already active sample
                            case "duplicate_name":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.METHOD_NOT_ALLOWED);
                                }
                                break;
                            case "duplicate_filter":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.CONFLICT);
                                }
                                break;
                        }

                        it(`POST ${url}`, function (done) {
                            client.request("POST", `${url}`, test.sample, config, function (err, response) {
                                if (responseCallback) {
                                    responseCallback.bind(this);
                                    responseCallback(err, response);
                                }
                                done();
                            })
                        });
                    });
                });
            });
        });

        let paused = [];
        let active = [];

        /**
         *
         * @param done {Done}
         */
        function check_GET_samples(done) {
            let url = `${samples_API_URL}/`;
            client.request("GET", `${url}`, null, config, function (err, response) {
                assert.strictEqual( !!err, false );
                assert.strictEqual( !!response.body, true );
                active = response.body.active;
                paused = response.body.paused;

                done();
            });
        }
        describe( "Check sample states after resume", function () {
            let url = `${samples_API_URL}/`;
            it( `GET ${url}`, check_GET_samples.bind( this ) );

            it(`"${tests.get("valid").sampleName}" should be active`, function () {
                let sampleName = tests.get("valid").sampleName;
                assert.strictEqual( active.includes( sampleName ), true );
                assert.strictEqual( paused.includes( sampleName ), false );
            });
            it(`"${tests.get("invalid").sampleName}" shouldn't exist`, function () {
                let sampleName = tests.get("invalid").sampleName;
                assert.strictEqual( active.includes( sampleName ), false );
                assert.strictEqual( paused.includes( sampleName ), false );
            });
            it(`"${tests.get("duplicate_name").sampleName}" should be active like ${tests.get("valid").sampleName}`, function () {
                let sampleName = tests.get("duplicate_name").sampleName;
                assert.strictEqual( active.includes( sampleName ), true );
                assert.strictEqual( paused.includes( sampleName ), false );
            });
            it(`"${tests.get("duplicate_filter").sampleName}" should be paused`, function () {
                let sampleName = tests.get("duplicate_filter").sampleName;
                assert.strictEqual( active.includes( sampleName ), false );
                assert.strictEqual( paused.includes( sampleName ), true );
            });
        });

        let statusIds = [];
/*
        publishSomeTweets(
            [ tests.get( "valid").sample.words.exact[0] ]
        )
            .then( (ids) => statusIds = ids );
*/
        describe( "Pause sample", function () {

            //await awaitTimeout( 10000 );

            tests.forEach((test, testType) => {
                describe("Test type:" + testType, function () {
                    let url = `${samples_API_URL}/${test.sampleName}/pause`;
                    describe(`Pause a sample "${test.sampleName}"`, function () {
                        let responseCallback;

                        switch (testType) {
                            case "valid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.OK);
                                }
                                break;
                            case "invalid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.NOT_FOUND);
                                }
                                break;
                            // duplicate_name sample have same tag of "valid" so can't be paused and already paused sample
                            case "duplicate_name":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.METHOD_NOT_ALLOWED);
                                }
                                break;
                            case "duplicate_filter":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.METHOD_NOT_ALLOWED);
                                }
                                break;
                        }

                        it(`POST ${url}`, function (done) {
                            client.request("POST", `${url}`, test.sample, config, function (err, response) {
                                if (responseCallback) {
                                    responseCallback.bind(this);
                                    responseCallback(err, response);
                                }
                                done();
                            })
                        });
                    });
                });
            })

            //return Promise.resolve();
        });

        describe( "Check sample states after pause", function () {
            let url = `${samples_API_URL}/`;
            it( `GET ${url}`, check_GET_samples.bind( this ) );

            it(`"${tests.get("valid").sampleName}" should be paused`, function () {
                let sampleName = tests.get("valid").sampleName;
                assert.strictEqual( active.includes( sampleName ), false );
                assert.strictEqual( paused.includes( sampleName ), true );
            });
            it(`"${tests.get("invalid").sampleName}" shouldn't exist again`, function () {
                let sampleName = tests.get("invalid").sampleName;
                assert.strictEqual( active.includes( sampleName ), false );
                assert.strictEqual( paused.includes( sampleName ), false );
            });
            it(`"${tests.get("duplicate_name").sampleName}" should be paused like ${tests.get("valid").sampleName}`, function () {
                let sampleName = tests.get("duplicate_name").sampleName;
                assert.strictEqual( active.includes( sampleName ), false );
                assert.strictEqual( paused.includes( sampleName ), true );
            });
            it(`"${tests.get("duplicate_filter").sampleName}" should be already paused`, function () {
                let sampleName = tests.get("duplicate_filter").sampleName;
                assert.strictEqual( active.includes( sampleName ), false );
                assert.strictEqual( paused.includes( sampleName ), true );
            });
        });

        describe( "Get sample items", function () {
            tests.forEach((test, testType) => {
                describe("Test type:" + testType, function () {
                    let url = `${samples_API_URL}/${test.sampleName}/`;
                    describe(`Get sample items"${test.sampleName}"`, function () {
                        let responseCallback;

                        switch (testType) {
                            case "valid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.OK);
                                    let items = response.body;
                                    assert.strictEqual(items.length, statusIds.length);
                                    assert.strictEqual( checkStatusIDS( items, statusIds ), true );
                                }
                                break;
                            case "invalid":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.NOT_FOUND);
                                }
                                break;
                            // duplicate_name sample have same tag of "valid" so can't be paused and already paused sample
                            case "duplicate_name":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.OK);
                                    let items = response.body;
                                    assert.strictEqual(items.length, statusIds.length);
                                    assert.strictEqual( checkStatusIDS( items, statusIds ), true );
                                }
                                break;
                            case "duplicate_filter":
                                responseCallback = function (err, response) {
                                    assert.strictEqual(!!err, false, err);
                                    assert.strictEqual(response.statusCode, StatusCodes.OK);
                                    let items = response.body;
                                    assert.strictEqual(items.length, 0);
                                }
                                break;
                        }

                        it(`GET ${url}`, function (done) {
                            client.request("GET", `${url}`, null, config, function (err, response) {
                                if (responseCallback) {
                                    responseCallback.bind(this);
                                    responseCallback(err, response);
                                }
                                done();
                            })
                        });
                    });
                });
            })
        });
    });
});
/*
describe( "Test use cases", function () {
    describe( "Use case - sampling and gather tweet", function () {

        describe( "Use case - sampling tweet geo-tagged in specific area", function () {
            let sampleName = "Use case geo"
            let url = `${samples_API_URL}/${sampleName}`;
            describe( "Create sample with bounding box locations", function () {
                describe( `Requesting ${samples_API_URL}`, function() {
                    it( "should return a Map of active/paused samples", function ( done ) {
                        client.request("get", samples_API_URL, {}, { json: true }, function ( err, response ) {
                            assert.strictEqual( !!err,false, err );
                            assert.strictEqual( response.statusCode, StatusCodes.OK );
                            let body = response.body;
                            assert.strictEqual( body.active && body.active.length >= 0 , true, "No active key in response body")
                            assert.strictEqual( body.paused && body.paused.length >= 0 , true, "No paused key in response body")
                            done();
                        })
                    })
                });
            })
        })

        describe( "Use case - sampling tweet with keywords", function () {

        })

        describe( "Use case - sampling tweet geo-tagged of a specific user", function () {

        })
    });
})
*/