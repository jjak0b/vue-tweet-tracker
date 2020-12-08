<template>
  <v-card
      width="100%"
      height="100%"
      elevation="0"
      :loading="loadingPercentage < 100"
  >
    <vue-word-cloud
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
                  <output>{{ weight }}</output>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                >Percentage</v-col>
                <v-col
                >
                  <output>{{ countWordMax > 0 ? `${ ( weight / countWordMax ).toFixed(2) } %` : "" }}</output>
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
    },
    computeWordsBySamples( wordToFilter ) {
      if( this.samples && this.samples.length > 0 ) {
        let texts = this.samples.map( (sample) => sample.data.text || "" );
        texts = texts.filter( (text) => text.length > 0 && ( !wordToFilter || text.includes( wordToFilter ) ) );
        const regexDetectWhiteSpaces = /(\s)+/g;
        const regexDetectNotWords = /(\W)+/g;
        const regexDetectURISequence = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;

        this.wordMap = null;
        this.wordMap = new Map();

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
    },
    updateWordsWeight() {
      this.wordsWeights = new Array( this.wordMap.size );
      this.countWordMax = 0;
      this.wordMap.forEach( (item, word) => {
        this.wordsWeights[ this.countWordMax ] = [ word, item.count ];
        this.countWordMax++;
      });
    },
    onWordClick( event, wordAndWeight ) {
      let word = wordAndWeight[ 0 ];
      // let weight = wordAndWeight[ 1 ];
      this.$emit( "input", word );
    },
    colorCallback( args ) {
      // let word = args[ 0 ];
      let weight = args[ 1 ];
      return "#" + this.color.rainbow.colourAt( weight );
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