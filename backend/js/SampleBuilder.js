const Sample = require("./Sample");
const SampleDescriptor = require("./SampleDescriptor");
const ItemsCollectionStorage = require("./ItemsCollectionStorage");
const FilterBuilder = require("./sampling/filters/FilterBuilder");
class SampleBuilder {

    constructor(storageLocation) {
        this.rootPath = storageLocation;
    }


    fetchSample( tag ) {
        return new Promise( (resolve, reject) => {
            SampleBuilder.fetchDescriptor( SampleBuilder.getSampleDescriptorLocation( tag ) )
                .then( (descriptor) => {
                    resolve( SampleDescriptor.clone( descriptor ) )
                })
                .catch( reject )
        });
    }

    buildSample( /*String*/tag, /*Filter*/filter) {
        let descriptor = FilterBuilder.build( filter );
        let collection = new ItemsCollectionStorage( SampleBuilder.getSampleCollectionLocation( tag ) );
        return new Sample( descriptor, collection );
    }

    static getSampleLocation( tag ) {
        return path.join( global.__basedir, process.env.PATH_REPOSITORIES_SAMPLES, tag );
    }

    static getSampleDescriptorLocation( tag ) {
        return path.join( SampleBuilder.getSampleLocation( tag ), "descriptor.json");
    }

    static getSampleCollectionLocation( tag ) {
        return path.join( SampleBuilder.getSampleLocation( tag ), "collection.json");
    }

    static fetchDescriptor( file ) {
        return new Promise( (resolve, reject) => {
            fs.readJson(
                file,
                {encoding: "utf-8"},
                (err, obj) => {
                    if( err ) {
                        console.error( "[Sample]", "Error while reading sample descriptor repo at " , filePath, "cause:", err);
                        reject( err );
                    }
                    else {
                        resolve( obj );
                    }
                }
            );
        });
    }
}