class Tweet {

    constructor( tweet ) {
        this.data = tweet.data;
        Object.keys(  tweet.includes )
            .forEach( (includeName) => {
                this[ includeName ] = tweet.includes[ includeName ][ 0 ];
            });
    }
}

module.exports = Tweet;