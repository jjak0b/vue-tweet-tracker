const WordMap = require("../WordMap");
const { expose } = require( "threads/worker" );

expose({
    /**
     *
     * @param array {Array}
     * @param getter {Function}
     * @return {WordMap}
     */
    async createAndUpdate( array, getter ) {
        let wordMap = new WordMap( array, getter );
        wordMap.update();
        return wordMap;
    }
})