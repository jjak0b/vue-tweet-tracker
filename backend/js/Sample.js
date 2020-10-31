const fs = require("fs-extra");
const path = require("path");

class Sample {

    constructor( id, rule, filter ) {
        this.path = path.join( global.__basedir, process.env.PATH_REPOSITORIES_SAMPLES, `${rule.tag}.json` );
        this.count = 0;
        fs.outputFile(
            this.path,
            "[\n",
            { encoding: "utf-8", flag: 'wx' },
            (err) => {
                if (err) {
                    switch( err.code ) {
                        case "EEXIST":
                            // this is not a problem, simply we will append to it
                            break;
                        default:
                            console.error( "[Sample]", "Error while creating sample repo at ", this.path, "cause:", err);
                            break;
                    }
                }
                else {
                    let isfirstSkipped = false;
                    fs.createReadStream( this.path )
                        .on('data', (chunk) => {
                            for (let i=0; i < chunk.length; ++i) {
                                if (chunk[i] == 10) {
                                    if( isfirstSkipped ) {
                                        ++this.count;
                                    }
                                    // skip first \n after "["
                                    else {
                                        isfirstSkipped = true;
                                    }
                                }
                            }
                        })
                        .on('end', () => {
                            console.log( `Detected ${this.count} items` );
                        });
                }
            }
        );


        this.id = id;
        this.rule = rule;
        this.filter = filter;
    }

    add( /*Tweet*/ tweet ) {
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

    getCollection( shouldGetPlainText = false ) {
        return new Promise( ( resolve, reject ) => {
           fs.readFile(
               this.path,
               {encoding: "utf-8"},
               (err, dataBuffer) => {
                   if( err ) {
                       reject( err.code );
                       return;
                   }

                   if( this.count > 0 ) {
                       // remove last comma ","
                       dataBuffer = dataBuffer.substring(0,dataBuffer.length - 2);
                   }
                   dataBuffer += "]";
                   if( shouldGetPlainText ) {
                       resolve( dataBuffer );
                   }
                   else {
                       try {
                           let parsed = JSON.parse( dataBuffer.toString() );
                           resolve( parsed );
                       }
                       catch (e) {
                           reject( e );
                       }
                   }
               }
           );
        });
    }
}

module.exports = Sample;