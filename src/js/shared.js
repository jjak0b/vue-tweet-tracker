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
            if (tweet.entities && tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {
                for ( const { tag } of tweet.entities.hashtags ) {
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