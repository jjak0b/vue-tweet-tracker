<template>
  <v-card
      width="100%"
      height="100%"
      elevation="0"
      :loading="loadingPercentage < 100"
  >
    <vue-word-cloud
        :animation-duration="1000"
        :animation-easing="'linear'"
        :enter-animation="'fade'"
        :leave-animation="'fade'"
        :rotation-unit="'deg'"
        :rotation="0"
        :words="wordsWeights"
        :color="colorCallback"
        font-family="Roboto"
        :spacing="0.5"
        :progress.sync="loadingProgress"
    >
      <template slot-scope="{text, weight, word}">
        <v-tooltip
            bottom
        >
          <template v-slot:activator="{ on, attrs }">
            <span
                class="wordCloud-word"
                v-bind="attrs"
                v-on="on"
                @click="onWordClick($event, word )"
            >{{ text }}</span>
          </template>
          <v-card
              color="info"
          >
            <v-card-title class="text-center"
            >{{ text }}</v-card-title>
            <hr>
            <v-card-text
                class="font-weight-medium text-center subtitle-1"
            >
              <v-row>
                <v-col
                >Frequency</v-col>
                <v-col
                >
                  <output>{{ wordMap.has( text ) ? (100 * wordMap.get( text ).percentage).toFixed( 2 ) : "?" }} %</output>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                >Count</v-col>
                <v-col
                >
                  <output>{{ wordMap.has( text ) ? wordMap.get( text ).count : "?" }} </output>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tooltip>
      </template>
    </vue-word-cloud>
  </v-card>
</template>

<script>

import VueWordCloud from 'vuewordcloud';
import Rainbow from "rainbowvis.js";

/***
 * ## props
 * - value (String): if set will be shown only samples' words that include this string
 * - samples (Array): array of samples required to show their texts words
 *
 * ## events
 * - input : If a word is clicked then it will be emitted as event's value
 */
export default {
  name: "WordCloud",
  components: {
    "vueWordCloud": VueWordCloud,
  },
  props: {
    //value: String,

    samples: Array
  },
  data() {
    return {
      /**
       * @type {Map<String,*>}
       */
      wordMap: null,
      countWordMax: 0,
      wordsWeights : [],
      loadingProgress: null,
      color: {
        rainbow: new Rainbow(),
        start: "#40c4ff",
        end: "#01579b"
      }
    }
  },
  computed: {
    loadingPercentage() {
      return this.loadingProgress && this.loadingProgress.totalWords !== 0
          ? Math.round(this.loadingProgress.completedWords / this.loadingProgress.totalWords * 100)
          : 100;
    }
  },
  watch: {
    /*value: function ( wordToFilter ) {
      this.updateWordCloud( wordToFilter );
    },*/
    samples: function () {
      this.updateWordCloud( this.value );
    },
    color: function () {
      this.color.rainbow.setSpectrum( this.color.start , this.color.end );
    }
  },
  created() {
    this.color.rainbow.setSpectrum( this.color.start , this.color.end );
  },
  mounted() {
    this.updateWordCloud( this.value );
  },
  methods: {
    updateWordCloud( wordToFilter ) {
      this.countWordMax = 0;
      this.computeWordsBySamples( wordToFilter );
      this.updateWordsWeight();
      this.color.rainbow.setNumberRange(1, this.countWordMax );
      this.$forceUpdate();
    },
    computeWordsBySamples( wordToFilter ) {
      this.wordMap = null;
      this.wordMap = new Map();
      console.log( `[WordCloud]`, `computing words of ${this.samples.length} samples`);
      if( this.samples && this.samples.length > 0 ) {
        let texts = this.samples.map( (sample) => sample.data ? sample.data.text : "" );
        texts = texts.filter( (text) => text.length > 0 && ( !wordToFilter || text.includes( wordToFilter ) ) );
        const regexDetectWhiteSpaces = /(\s)+/g;
        const regexDetectNotWords = /(\W)+/g;
        const regexDetectURISequence = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;

        for (const text of texts) {
          let words = text.trim()
              .replace(regexDetectURISequence," ")
              .replace(regexDetectNotWords," ") // exclude punctuation with a following start spacing
              .replace(regexDetectWhiteSpaces," ") //2 or more white-space to 1
              .split(" ")
              .filter( (word) => word.length );

          for (const word of words) {
            let data = this.wordMap.get( word );
            if( !data ) {
              this.wordMap.set( word, {
                count: 1
              });
            }
            else {
              data.count++;
            }
          }
        }
      }
      console.log( `[WordCloud]`, `computing complete, ${ this.wordMap.size} keywords found`);
    },
    updateWordsWeight() {
      const max = 128;
      this.wordsWeights = [];
      let wordsWeights = new Array( this.wordMap.size );
      console.log( `[WordCloud]`, `creating entries`);
      let totalWordsCount = 0;
      let start = performance.now();
      this.wordMap.forEach( (item) => {
        totalWordsCount += item.count;
      });
      let i = 0;
      const wordSizeBase = 12;
      this.wordMap.forEach( (item, word) => {
        item.percentage = item.count / totalWordsCount;
        wordsWeights[ i ] = [ word, ( wordSizeBase * Math.sqrt( item.count ) ) ];
        i++;
      });
      let end = performance.now();
      console.log( `[WordCloud]`, `created entries in ${end-start} ms` );

      console.log( `[WordCloud]`, `sorting entries`);
      start = performance.now();
      wordsWeights.sort( (l, r ) =>  r[1] - l[1] );
      end = performance.now();
      console.log( `[WordCloud]`, `sorted in ${end-start} ms`);

      this.countWordMax = this.wordMap.get( wordsWeights[ 0 ][ 0 ] ).count;

      if( wordsWeights.length >= max ) {
        console.log( `[WordCloud]`, `slicing max ${max} words`);
        wordsWeights.splice(max, i);
      }
      console.log( `[WordCloud]`, `words weight computing complete`);
      // console.log( wordsWeights );
      this.wordsWeights = wordsWeights;

    },
    onWordClick( event, wordAndWeight ) {
      let word = wordAndWeight[ 0 ];
      // let weight = wordAndWeight[ 1 ];
      this.$emit( "input", word );
    },
    colorCallback( args ) {
      let word = args[ 0 ];
      // let weight = args[ 1 ];
      let wordItem = this.wordMap.get( word );
      return "#" + this.color.rainbow.colourAt( wordItem.count );
    }
  },
}
</script>

<style scoped>
/* Remove unnecessary css of v-tooltip */
.v-tooltip__content {
  padding: 0;
}

.wordCloud-word {
  cursor: pointer;
}
</style>