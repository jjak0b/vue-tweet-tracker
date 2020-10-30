class Tweet {

    constructor( tweet ) {
        this.data = tweet.data;
        this.users = tweet.includes.users;
        this.place = tweet.includes.place;
    }
}

module.exports = Tweet;