class Tweet {

    constructor( tweet ) {
        this.data = tweet.data;
        Object.keys(  tweet.includes )
            .forEach( (includeName) => {
                if( Array.isArray( tweet.includes[ includeName ] ) ) {
                    if( includeName === "media") {
                        this[ includeName ] = tweet.includes[ includeName ];
                    }
                    else {
                        this[ includeName ] = tweet.includes[ includeName ][0];
                    }
                }
            });
    }
}

module.exports = Tweet;