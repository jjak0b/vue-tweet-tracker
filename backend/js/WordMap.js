class WordMap extends Map {
    /**
     *
     * @param array {Array}
     * @param textGetterFunc {Function}
     */
    constructor( array, textGetterFunc ) {
        super();
        this.rawData = array;
        /**
         *
         * @type {(function(*): String)}
         */
        this.getText = textGetterFunc || function (item){ return item };
    }

    update() {
        // const regexDetectStartAndEndWhiteSpace = /(^\s*)|(\s*$)/gi;
        const regexDetectMore1WhiteSpaces = /(\s)+/g;
        const regexDetectPunctuationAndSpace = /(\W)+/g;
        const regexDetectURI = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
        let words = null;
        for (const item of this.rawData) {
            words = this.getText( item )
                .trim() // .replace(regexDetectStartAndEndWhiteSpace,"") //exclude  start and end white-space
                .replace(regexDetectURI," ")
                .replace(regexDetectPunctuationAndSpace," ") // exclude punctuation with a following start spacing
                .replace(regexDetectMore1WhiteSpaces," ") //2 or more white-space to 1
                .split(" ")
                .filter( (word) => word.length );

            this.addWords( words );
        }
    }

    /**
     *
     * @param words {Array}
     */
    addWords( words ) {
        for (const word of words) {
            let data = this.get( word );
            if( !data ) {
                this.set( word, {
                    count: 1
                });
            }
            else {
                data.count++;
            }
        }
    }

    dispose() {
        this.rawData = null;
        this.getText = null;
    }
}

module.exports = WordMap;