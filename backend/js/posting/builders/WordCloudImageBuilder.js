const Canvas = require("canvas");
const d3 = require("d3");
const Cloud = require("d3-cloud");
const JSDOM = require("jsdom").JSDOM;
const svg2img = require('svg2img');
const WordMap = require("../../WordMap");
const MediaInfo = require("../MediaInfo");

class WordCloudImageBuilder {
    constructor() {
        this.layout = null;
        /**
         *
         * @type {WordMap}
         */
        this.wordMap = null;
        this.maxWordItemsCount = 128;
        this.worditems = [];
        this.processedWordItems = [];
        this.workingDOM = new JSDOM("<!DOCTYPE html><body></body>");
        /**
         *
         * @type {Buffer}
         */
        this.imageBuffer = null;
    }

    createWordCloud() {

    }

    /**
     *
     * @param wordMap {WordMap}
     */
    buildWordItems( wordMap ) {
        this.wordMap = wordMap;
        /**
         * @type {{}[]}
         */
        this.worditems = Array.from( this.wordMap.entries() )
            .map( (item) => {
                return Object.assign(
                    {
                        text: item[ 0 ],
                    },
                    item[1]
                )
            });

        this.worditems = this.worditems.sort( (l, r) => r.count - l.count );

        if( this.worditems.length > this.maxWordItemsCount ) {
            this.worditems = this.worditems.slice(0, this.maxWordItemsCount);
        }
    }


    /**
     *
     * @param width
     * @param height
     * @return {Promise<void>}
     */
    async buildLayout( width, height ) {
        const baseWidth = 1280;
        const baseHeight = 720;
        width = width || baseWidth;
        height = height || baseHeight;

        const baseSize = 24; // fontSize on 1280 x 720 size
        let baseFontSize = baseSize;
        if( width * height !== 1280*720 ) {
            // baseSize : baseWidth = x : width
            baseFontSize = (baseSize/baseWidth) * width;
        }

        this.layout = Cloud()
            .size([width, height])
            .words( this.worditems )
            .padding(1)        //space between words
            .rotate(0)       // rotation angle in degrees
            .font("Impact")
            .text( (item) => item.text )
            // .fontSize(function(item) { return 10 + (100 * (item.count / totalCount)) } )
            .fontSize(function(item) {
                // resize font size based on word count but no more than 1/4 of width
                return baseFontSize *
                    Math.min(
                        width >> 2,
                        Math.sqrt( item.count )
                    )
            })
            // .spiral("archimedean") // set by default
            // this canvas is used by the lib to place the items
            .canvas(function() { return new Canvas.Canvas( 1, 1 ); } );
        return new Promise( (resolve) => {
            this.layout.on("end", (processedItems) => {
                this.layout.stop();
                this.processedWordItems = processedItems;
                resolve();
            });
            this.layout.start();
        });
    }

    buildStyle() {

        let colorPalette = d3.scaleOrdinal(d3.schemeCategory10);
        let body = this.workingDOM.window.document.querySelector( "body" );

        // cleanup and init
        this.svgNode = null;
        this.svgNode = d3.select( body )
            .html('').append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        let width = this.layout.size()[0];
        let height = this.layout.size()[1];
        // setup style
        this.svgNode
            .attr("width", width)
            .attr("height", height)
            .append("g")
            // right-shift sizes so divide them by 2 and translate them to center
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
            .data(this.processedWordItems)
            .enter().append("text")
            .text(function(d) { return d.text; })
            .style("font-family", "Impact")
            .style("background", `rgba(0,0,0,0);`)
            .style("font-size", function(d) {return d.size + "px"; })
            .style("fill", function(d, i) { return colorPalette(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            });
    }

    async buildImage() {
        return new Promise( (resolve, reject) => {
        let svgString = this.svgNode.node().parentNode.innerHTML; // get svg XML
        let svgBase64 = 'data:image/svg+xml;base64,'+ Buffer.from(svgString).toString("base64");
        svg2img(
            svgBase64,
            {
                format:'png',
            },
            (error, /*Buffer*/buffer) => {
                if(!error) {
                    this.imageBuffer = buffer;
                    resolve();
                }
                else {
                    console.error(`[${this.constructor.name}]`, "Error converting svg to image, cause:\n", error );
                    reject( error );
                }
            });
        });
    }

    /**
     * Return a MediaInfo with base64 encoded data image
     * @return {MediaInfo}
     */
    getResult() {
        return new MediaInfo("WordCloud", this.imageBuffer, "image/png");
    }
}

module.exports = WordCloudImageBuilder;