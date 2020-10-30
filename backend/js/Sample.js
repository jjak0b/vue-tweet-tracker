const fs = require("fs-extra");
const path = require("path");

class Sample {

    constructor( id, rule ) {
        this.path = path.join( global.__basedir, process.env.PATH_REPOSITORIES_SAMPLES, `${rule.tag}.json` );
        this.count = 0;
        fs.outputFile(
            this.path,
            "[\n",
            { encoding: "utf-8", flag: 'wx' },
            function (err) {
                if (err) {
                    console.error( "[Sample]", "Error while creating sample repo at ", this.path, ";cause:", err);
                }
                else {
                    let isfirstSkipped = false;
                    fs.createReadStream( this.path )
                        .on('data', function(chunk) {
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
                        .on('end', function() {
                            this.count ++;
                        });
                }
            }
        );


        this.id = id;
        this.rule = rule;
    }

    add( /*Tweet*/ tweet ) {
        let json = JSON.stringify(tweet);
        if( this.count > 0 ) {
            // add ",\n" as prefix so it's close to a valid json
            json = json.replace(/^/,',\n');
        }
        fs.appendFile(
            this.path,
            json,
            {encoding: "utf-8"},
            (err) => {
                 if( err ) {
                     console.error( "[Sample]", "Error appenind data to", this.tag );
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
               function (err, dataBuffer) {
                   if( err ) {
                       reject( err.code );
                       return;
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