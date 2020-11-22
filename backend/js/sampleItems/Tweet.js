const SampleItem = require("./SampleItem");

class Tweet extends SampleItem {
    constructor( tweet ) {
        super( tweet )
        this.data = tweet.data;
        this.users = tweet.users;
        this.places = tweet.places;
        /**
         * @type []
         */
        this.media = tweet.media;
    }

    /**
     *
     * @param responseData
     * @return {Tweet[]}
     * @constructor
     */
    static toArrayFromResponse( responseData ) {
        let items;
        if( responseData.data ) {
            items = new Array( responseData.data.length );
            for (let i = 0; i < responseData.data.length; i++) {
                let item = responseData.data[ i ];
                let tweet = Object.assign( {}, { data: item } );

                if( item.geo && item.geo.place_id ) {
                    let places = responseData.includes["places"]. filter((field) => field.id === item.geo.place_id);
                    tweet.places = places[0];
                }

                if( item.author_id ) {
                    let users = responseData.includes["users"].filter((field) => field.id === item.author_id);
                    tweet.users = users[0];
                }

                if( item.attachments && item.attachments.media_keys ) {
                    tweet.media = responseData.includes["media"].filter((field) => item.attachments.media_keys.includes(field.media_key) );
                }

                items[i] = new Tweet( tweet );
            }
        }
        return items;
    }
}

module.exports = Tweet;