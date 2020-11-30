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
                >Frequenza</v-col>
                <v-col
                >
                  <output>{{ weight }}</output>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                >Percentuale totale</v-col>
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
import Rainbow from "../../../node_modules/rainbowvis.js/rainbowvis";

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
    [VueWordCloud.name]: VueWordCloud,
  },
  props: {
    //value: String,

    samples: Array
  },
  data() {
    return {
      countWordMax: 0,
      weights: {},
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
  /*mounted() {
    this.updateWordCloud( this.value );
  },*/
  methods: {
    updateWordCloud( wordToFilter ) {
      this.countWordMax = 0;
      this.computeWordsBySamples( wordToFilter );
      this.updateWordsWeight();
      this.color.rainbow.setNumberRange(1, this.countWordMax );
    },
    computeWordsBySamples( wordToFilter ) {
      for (let i = 0; i < this.samples.length; i++) {
        if( this.samples[ i ] && this.samples[ i ].data.text ) {
          let text = this.samples[ i ].data.text;
          if( !wordToFilter || text.includes( wordToFilter ) ) {
            this.computeWords( text );
          }
        }
      }
    },
    computeWords( string ) {
      if( !string || string.length < 1 ) return;
      // remove punctuation
      let tempWords = string.replace(/[.,/?!$%^&*;:{}=\-_"'`~()]/gm, " ").split( " " );

      // count the words and add them to the list of those used
      tempWords.forEach( ( word ) => {
        // Pick only meaningful words
        /* Note:  it is necessary because a combination like "," ("," + "") is converted to ""
                  and then in [""] using split()
         */

        let wordCount = 0;
        if( word.length > 0 ) {
          if( !(word in this.weights) ) {
            wordCount = this.weights[ word ] = 1;
          }
          else {
            wordCount = 1 + (this.weights[ word ] ++)
          }
          this.countWordMax = Math.max( this.countWordMax, wordCount );
        }
      });
    },
    updateWordsWeight() {
      let words = Object.keys( this.weights );
      this.wordsWeights = new Array( words.length );

      words
          .forEach( (word, i ) => this.wordsWeights[ i ] = [ word, this.weights[ word ] ] );
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