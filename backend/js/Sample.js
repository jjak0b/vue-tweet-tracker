const fs = require("fs-extra");
const path = require("path");

class Sample {
    constructor( /*SampleDescriptor*/descriptor, /*ItemsCollection*/collection) {
        this.path = path.join( global.__basedir, process.env.PATH_REPOSITORIES_SAMPLES, descriptor.getTag() );

        this.descriptor = descriptor;
        this.collection = collection;
    }

    add( /*Tweet*/ tweet ) {
        this.collection.add( tweet );
        let json = JSON.stringify(tweet);
        // add ",\n" as postfix so it's close to a valid json
        json += ",\n";

        fs.appendFile(
            this.path,
            json,
            {encoding: "utf-8"},
            (err) => {
                 if( err ) {
                     console.error( "[Sample]", "Error appendind data to", this.tag );
                 }
                 else {
                     ++this.count;
                 }
            }
        );
    }

    getCollection( ) {
        return this.collection;
    }
}

module.exports = Sample;