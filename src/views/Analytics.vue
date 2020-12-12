<template>
  <div v-if="localSample">
    <v-card v-if="labelDates.length > 0" class="pa-4">
      <v-card-title>Geographical tweets chart</v-card-title>

      <v-select
          :items="Object.keys(tweetsCountry)"
          v-model="selectedState"
          label="Select a state to see the chart"
          dense
          outlined
      ></v-select>

      <div v-if="selectedState">
        <v-btn v-if="(slice+7<=labelDates.length) || (slice>0 && slice<labelDates.length)"
               @click="seeMore(1)"
        >
          See most recents informations
          <v-icon right>mdi-arrow-right-drop-circle-outline</v-icon>
        </v-btn>
        <line-chart :selected-state="selectedState" :chart-data="LineData"></line-chart>
      </div>
    </v-card>
    <v-card v-if="labelWords.length > 0 && wordsFrequency.length > 0" class="pa-4 mt-4">
      <v-card-title>Words frequency chart</v-card-title>
      <div>
        <v-btn v-if="(sliceWords+10<=labelWords.length) || (sliceWords>0 && sliceWords<labelWords.length)"
               @click="seeMore(2)"
        >
          See other words
          <v-icon right>mdi-arrow-right-drop-circle-outline</v-icon>
        </v-btn>
        <bar-chart :chart-data = "BarData"></bar-chart>
      </div>
    </v-card>
    <v-card v-if="labelHashtags.length > 0 && hashtagsFrequency.length > 0" class="pa-4 mt-4">
      <v-card-title>Hashtags frequency chart</v-card-title>
      <div>
        <v-btn v-if="(sliceHashtag+10<=labelHashtags.length) || (sliceHashtag>0 && sliceHashtag<labelHashtags.length)"
               @click="seeMore(3)"
        >
          See other hashtags
          <v-icon right>mdi-arrow-right-drop-circle-outline</v-icon>
        </v-btn>

        <bar-chart :chart-data = "HashtagBarData"></bar-chart>
      </div>
    </v-card>
    <v-card v-if="Object.keys(tweetsDomain).length > 0" class="pa-4 mt-4">
     <v-card-title>Context chart</v-card-title>
      <v-select
          :items="Object.keys(tweetsDomain)"
          v-model="selectedDomain"
          label="Select a context category to see the chart of all the topics discussed in tweets"
          dense
          outlined
      ></v-select>
      <div
          class="d-flex"
      >
          <pie-chart
              class="pie-chart mx-auto"
              :chart-data = "BarCakeData"
          ></pie-chart>
      </div>
    </v-card>
  </div>
</template>

<script>
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import Rainbow from "rainbowvis.js";
import {getWordMapFromStringArray, getHashtags, getContextEntities} from "@/js/shared";

export default {
  name: "Analytics",

  components:{
    LineChart,
    BarChart,
    PieChart
  },

  props: {
    localSample: Array,
  },

  data: () => ({
    tweets: [],
      //LineChart
    labelDates:[],
    tweetsCountry: {},
    LineData: {},
    selectedState:"",
    slice: 0,
      //BarChart
    BarData:{},
    labelWords:[],
    wordsFrequency:[],
    sliceWords: 0,
      //BarChart per frequenza hashtag
    HashtagBarData:[],
    labelHashtags:[],
    hashtagsFrequency:[],
    sliceHashtag: 0,
     //PieChart per i domini
    tweetsDomain: {},
    BarCakeData: {},
    selectedDomain:"",
    RainbowColors: {
      rainbow: new Rainbow(),
      colorSpectrum: [
        '#FFA2EB',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF4040',
        '#185A84',
        '#5A5A02',
        '#2DCE50',
        '#5A0F32'
      ]
    }
  }),


  watch: {

    localSample: function (newVal) {
      this.updateCharts(newVal);
    },

    slice: function (){
      this.LineData = this.createLineData();
    },

    sliceWords: function (){
      this.BarData = this.createBarData();
    },

    sliceHashtag: function(){
      this.HashtagBarData = this.createBarDataForHashtags();
    },

    selectedState: function (newVal){
      if( newVal ) {
        this.slice = 0; //Ricomincio dall'inizio
        this.LineData = this.createLineData();
      }
      else {
        this.LineData = {};
        this.slice = 0;
      }
    },
    selectedDomain: function(newVal){
      if( newVal )
        this.BarCakeData = this.createCakeForDomains(newVal);
      else
        this.BarCakeData = {};
    }

  },

  created() {
    // when page load first time and there is no current sample selected, then  will be wasted
    // but this is neded to show charts when user visit this page and the came from another page
    this.updateCharts( this.localSample );
  },

  methods: {
    updateCharts(tweets) {
      if( !tweets ) tweets = [];
      this.tweets = tweets;
      this.selectedState = null;
      this.tweetsCountry = this.addCountriesData();
      if( this.selectedState ) {
        this.LineData = this.createLineData();
      }
      this.createWordsData();
      this.BarData = this.createBarData();
      //Se cambiano i tweets ricomincio da capo
      this.sliceWords = 0;
      this.slice = 0;
      this.sliceHashtag = 0;
      this.createHashtagsData();
      this.HashtagBarData = this.createBarDataForHashtags();
      this.selectedDomain = 0;
      this.tweetDomains = this.addDomains();
    },
    //LINECHART FUNCTIONS
    addCountriesData:function() {
      let countriesData = {};
      let labelDates = [];

      for (let tweet of this.tweets) {
        if(tweet.places){
          //Controllo se lo stato è già presente
          if (!(tweet.places.country in countriesData)) {
            countriesData[tweet.places.country] = {};
          }
          //Controllo se la regione del tweet è già presente in quello stato
          let region = this.getRegion(tweet.places.full_name);
          let data = this.getData(tweet.data.created_at);
          //Se non c'è la aggiungo e aggiungo un tweet in quella regione per quella data
          if (!(region in countriesData[tweet.places.country])) {
            countriesData[tweet.places.country][region] = {[data]:1};
              //Controllo se ho già aggiunto quella data per altri tweet
            if(!(labelDates.includes(data))){
              labelDates.push(data);
            }
          } //Se non ho ancora aggiunto tweet in quella data ma ho già aggiunto la regione aggiungo solo la data
          else if (!(data in countriesData[tweet.places.country][region])) {
            countriesData[tweet.places.country][region][data] = 1;
              //Controllo se ho già aggiunto quella data per altri tweet
            if(!(labelDates.includes(data))){
              labelDates.push(data);
            }
          } else {
            countriesData[tweet.places.country][region][data] += 1;
          }
        }
      }
      this.labelDates = this.orderDates(labelDates)
      return countriesData;
    },

    createLineData:function(){
      //Solo qui l'array mi serve splittato quindi lo creo qui, parto da slice e fino ad altri 7
      let regions = Object.keys(this.tweetsCountry[this.selectedState]);
      let datasets = [];
      let sliceDates = this.labelDates.slice(this.slice,this.slice+7);
      this.RainbowColors.rainbow.setSpectrumByArray(this.RainbowColors.colorSpectrum);
      this.RainbowColors.rainbow.setNumberRange(0, regions.length+1);

      for (let i = 0; i < regions.length; i++) {
        let region = regions[i];
        let tweetsXDay = this.setTweetsXDay(region, sliceDates); //Da passare lo slice
        let randomColor = "#"+this.RainbowColors.rainbow.colorAt(i);
        let obj = new Object(
            {label: region,
            data: tweetsXDay,
            fill: false,
            borderColor: randomColor,
            backgroundColor: randomColor,
            borderWidth: 1})
        datasets.push(obj);
      }

      let chartData = {
        labels: sliceDates,
        datasets: datasets
      }

      return chartData;
    },

    //UTILI per LINECHART
    getRegion(country_string) {
      //Prendo la posizione della virgola nella stringa
      let i = country_string.indexOf(',');
      //Tengo solo la parte di stringa dopo la virgola
      country_string = country_string.substring(i + 2);
      return country_string;
    },

    getData(data_string) {
      //Prendo la posizione della T che separa la data dall'ora nel tweet
      let i = data_string.indexOf('T');
      data_string = data_string.substring(0, i);
      return data_string;
    },

    orderDates:function (arrayDates){
      arrayDates.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a) - new Date(b);
      });
      return arrayDates;
    },

    setTweetsXDay: function (region, sliceDates){
      let tweetsXDay = [];
      //labelDates da prendere solo lo slice
      sliceDates.forEach(date => {
        if (!(this.tweetsCountry[this.selectedState][region][date])) {
          tweetsXDay.push(0);
        } else {
          tweetsXDay.push(this.tweetsCountry[this.selectedState][region][date]);
        }
      })
      return tweetsXDay;
    },

    seeMore: function (buttonNumber){
      if(buttonNumber === 1){ //BUTTON LINE CHART
        if(this.slice+7 <= this.labelDates.length) this.slice += 7;
        else if(this.slice > 0 && this.slice< this.labelDates.length){
          let difference = this.labelDates.length - this.slice;
          this.slice += difference;
        }
      }
      else if(buttonNumber === 2){ //BUTTON BAR CHART
        if(this.sliceWords+10 <= this.labelWords.length) this.sliceWords += 10;
        else if(this.sliceWords > 0 && this.sliceWords< this.labelWords.length){
          let difference = this.labelWords.length - this.sliceWords;
          this.sliceWords += difference;
        }
      }
      else if(buttonNumber === 3){ //BUTTON BAR CHART FOR HASHTAGS
        if(this.sliceHashtag+10 <= this.labelHashtags.length) this.sliceHashtag += 10;
        else if(this.sliceHashtag > 0 && this.sliceHashtag< this.labelHashtags.length){
          let difference = this.labelHashtags.length - this.sliceHashtag;
          this.sliceHashtag += difference;
        }
      }
    },

    //FUNZIONI BARCHART
    createWordsData:function (){
      let texts = this.tweets.map((tweet) => tweet.data ? tweet.data.text: "");
      let wordsMap = getWordMapFromStringArray(texts);
      let orderedMap = new Map([...wordsMap].sort((a, b) => (b[1].count > a[1].count && 1) || (b[1].count === a[1].count ? 0 : -1)))
      let labelWords = [];
      let wordsFrequency = [];

      orderedMap.forEach((value, key) => {
        labelWords.push(key);
        wordsFrequency.push(value.count);
      })

      this.labelWords = labelWords;
      this.wordsFrequency = wordsFrequency;
    },

    createBarData: function (){
      let sliceWords = this.labelWords.slice(this.sliceWords,this.sliceWords+10);
      let sliceFrequency = this.wordsFrequency.slice(this.sliceWords, this.sliceWords+10)
      let dataset = [];

      let obj = new Object({
        label: 'Words',
        borderWidth: 1,
        backgroundColor: [],
        borderColor: [],
        pointBorderColor: '#2554FF',
        data: sliceFrequency
      })
      let colors = new Array(sliceWords.length);
      this.RainbowColors.rainbow.setSpectrumByArray(this.RainbowColors.colorSpectrum);
      this.RainbowColors.rainbow.setNumberRange(0, sliceWords.length+1);
      for (let i = 0; i < sliceWords.length; i++) {
        colors[i]="#"+this.RainbowColors.rainbow.colorAt(i);
      }
      obj.backgroundColor = colors;
      obj.borderColor = colors;
      dataset.push(obj);

      let chartData = {
        labels: sliceWords,
        datasets: dataset
      }

      return chartData;
    },
    //BARCHART PER GLI HASHTAG
    createHashtagsData:function (){
      let hashMap = getHashtags(this.tweets);
      let orderedEntries = Array.from(hashMap.entries());
      orderedEntries.sort((a, b) => (b[1].count - a[1].count));
      let labelHashtags = orderedEntries.map((item)=>item[0]);
      let hashtagsFrequency = orderedEntries.map((item)=>item[1].count);

      this.labelHashtags = labelHashtags;
      this.hashtagsFrequency = hashtagsFrequency;
    },

    createBarDataForHashtags: function (){
      let sliceHashtags = this.labelHashtags.slice(this.sliceHashtag,this.sliceHashtag+10);
      let sliceFrequency = this.hashtagsFrequency.slice(this.sliceHashtag, this.sliceHashtag+10)
      let dataset = [];

      let obj = new Object({
        label: 'HashTags',
        borderWidth: 1,
        backgroundColor: [],
        borderColor: [],
        pointBorderColor: '#2554FF',
        data: sliceFrequency
      })
      let colors = new Array(sliceHashtags.length);
      this.RainbowColors.rainbow.setSpectrumByArray(this.RainbowColors.colorSpectrum);
      this.RainbowColors.rainbow.setNumberRange(0, sliceHashtags.length+1);
      for (let i = 0; i < sliceHashtags.length; i++) {
        colors[i]="#"+this.RainbowColors.rainbow.colorAt(i);
      }
      obj.backgroundColor = colors;
      obj.borderColor = colors;
      dataset.push(obj);

      let chartData = {
        labels: sliceHashtags,
        datasets: dataset
      }

      return chartData;
    },
    //BARCHART PLACEHOLDER PER I DOMINI

    addDomains: function(){
      this.tweetsDomain = {};
      let domainMap = getContextEntities(this.tweets);
      let frequencies;
      let entityNames;
      domainMap.forEach((entityMap, domainName)=>{
        frequencies = new Array();
        entityNames = new Array();
        entityMap.forEach(({count} ,entityName)=>{
          frequencies.push(count);
          entityNames.push(entityName);
        })
        this.tweetsDomain[domainName] =  {
          frequencies: frequencies,
          entityNames: entityNames
        };
      })
    },

    createCakeForDomains: function (domainName){
      let frequencies = this.tweetsDomain[domainName].frequencies;
      let names = this.tweetsDomain[domainName].entityNames;
      let dataset = [];

      let obj = new Object({
        label: 'Contexts',
        borderWidth: 1,
        backgroundColor: [],
        borderColor: [],
        data: frequencies
      })
      let colors = new Array(names.length);
      this.RainbowColors.rainbow.setSpectrumByArray(this.RainbowColors.colorSpectrum);
      this.RainbowColors.rainbow.setNumberRange(0, names.length+1);
      for (let i = 0; i < names.length; i++) {
        colors[i]="#"+this.RainbowColors.rainbow.colorAt(i);
      }
      obj.backgroundColor = colors;
      obj.borderColor = colors;
      dataset.push(obj);

      let chartData = {
        labels: names,
        datasets: dataset
      }
      return chartData;
    }
  }
}
</script>
<style scoped>
.pie-chart {
  width: 75%;
}
</style>