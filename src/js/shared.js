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