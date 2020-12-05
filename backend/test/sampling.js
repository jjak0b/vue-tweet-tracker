const assert = require('assert');
require('dotenv').config();
const {StatusCodes} = require( "http-status-codes" );
const client = require("needle");


// change this if needed
let httpProtocol = "http";
let host = "localhost";
let samples_API_URL = `${httpProtocol}://${host}:${process.env.PORT}/api/samples`;

describe( "Test sampling API" , function () {

    let today = new Date().toISOString().slice(0, 10);
    let tests = new Map([
        [
            "valid",
            {
                sampleName: "Basic Test",
                sample: {
                    words: {
                        exact : [ "test " + today ],
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
                    any : ["test", today ],
                    exact : [ "test " + today ],
                }
            }
        }
    )
    let config = { json: true };

    describe( "cleanup samples", function () {
        tests.forEach( (test, testType) => {
            let url = `${samples_API_URL}/${test.sampleName}`;
            it( `clear samples used for test "${testType}"`, function () {
                return client.request("DELETE", url, null, config )
            });
        })
    });

    tests.forEach( (test, testType) => {
        describe( "Test type:"+ testType, function () {

            describe( "basic full API test", function () {
                let url = `${samples_API_URL}/${test.sampleName}`;
                let can;
                can = {
                    create: false,
                    getItems: false,
                    setActive: false,
                    setPaused: false,
                    delete: false
                };

                switch ( testType ) {
                    case "valid":
                        can = {
                            create: true,
                            getItems: true,
                            setActive: true,
                            setPaused: true,
                            delete: true
                        };
                        break;
                    case "invalid":
                        can = {
                            create: true,
                            getItems: true,
                            setActive: true,
                            setPaused: true,
                            delete: true
                        };
                        break;
                    case "duplicate_name":
                        can = {
                            create: true,
                            getItems: false,
                            setActive: false,
                            setPaused: false,
                            delete: false
                        };
                        break;
                }

                ( can.create ? describe : describe.skip)( `Add a sample "${test.sampleName}"`, function ( done ) {
                    let responseCallback;

                    switch( testType ) {
                        case "valid":
                            responseCallback = function ( err, response ) {
                                assert.strictEqual( !!err,false, err );
                                assert.strictEqual( response.statusCode, StatusCodes.CREATED);
                            }
                            break;
                        case "invalid":
                            responseCallback = function ( err, response ) {
                                assert.strictEqual( !!err,false, err );
                                assert.strictEqual( response.statusCode, StatusCodes.NOT_ACCEPTABLE);
                            }
                            break;
                        case "duplicate_name":
                            responseCallback = function ( err, response ) {
                                assert.strictEqual( !!err,false, err );
                                assert.strictEqual( response.statusCode, StatusCodes.CONFLICT);
                            }
                            break;
                    }

                    it( `PUT ${url}`, function () {
                        client.request("PUT", url, test.sample, config, function ( err, response ) {
                            if( responseCallback ) {
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