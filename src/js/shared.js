/**
 *
 * @param texts {String[]}
 * @return {Map<String, {count: Number}>}
 */
export function getWordMapFromStringArray(texts) {

    let wordMap = new Map();
    if( texts && texts.length > 0 ) {
        const regexDetectWhiteSpaces = /(\s)+/g;
        const regexDetectNotWords = /(\W)+/g;
        const regexDetectURISequence = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;

        for (const text of texts) {
            let words = text.trim()
                .replace(regexDetectURISequence," ")
                .replace(regexDetectNotWords," ") // exclude punctuation and not words
                .replace(regexDetectWhiteSpaces," ") //2 or more white-space to 1
                .split(" ")
                .filter( (word) => word.length );

            for (const word of words) {
                let data = wordMap.get( word );
                if( !data ) {
                    wordMap.set( word, {
                        count: 1
                    });
                }
                else {
                    data.count++;
                }
            }
        }
    }
    return wordMap;
}

/**
 *
 * @param tweets
 * @return {Map<String, {count: Number}>}
 */
export function getHashtags( tweets ) {
    let hashtagMap = new Map();
    if( tweets && tweets.length > 0 ) {
        for (const tweet of tweets) {
            if (tweet.data.entities && tweet.data.entities.hashtags && tweet.data.entities.hashtags.length > 0) {
                for ( const { tag } of tweet.data.entities.hashtags ) {
                    let data = hashtagMap.get( tag );
                    if (!data) {
                        hashtagMap.set( tag, {
                            count: 1
                        });
                    }
                    else {
                        data.count++;
                    }
                }
            }
        }
    }
    return hashtagMap;
}

/**
 * return Map with keys the domain name and value as a Map with key the entity's name and value a { count : Number }
 * @param tweets
 * @return {Map<String, Map<String, {count: Number}>>}
 */
export function getContextEntities(tweets) {

    /**
     * K: domain context
     * V: entities context
     * @type {Map<String, Map<String, {count: Number}>>}
     */
    let contextMap = new Map();
    if( tweets && tweets.length > 0 ) {
        for (const tweet of tweets) {
            if (tweet.data.context_annotations && tweet.data.context_annotations.length > 0) {
                for ( const { domain, entity } of tweet.data.context_annotations) {
                    let data = contextMap.get( domain.name );
                    if (!data) {
                        contextMap.set(
                            domain,
                            new Map([
                                [
                                    entity.name,
                                    {
                                        count: 1
                                    }
                                ]
                            ]),
                        );
                    }
                    else {
                        data.count++;
                    }
                }
            }
        }
    }
    return contextMap;
}