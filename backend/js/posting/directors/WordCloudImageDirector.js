class WordCloudImageDirector {
    /**
     *
     * @param builder {WordCloudImageBuilder}
     */
    constructor( builder ) {
        this.builder = builder;
    }


    async construct( wordMap, width, height, ) {
        this.builder.buildWordItems( wordMap );
        await this.builder.buildLayout(width, height);
        this.builder.buildStyle();
        await this.builder.buildImage();
    }
}

module.exports = WordCloudImageDirector;