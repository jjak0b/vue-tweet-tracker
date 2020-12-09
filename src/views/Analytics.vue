<template>
  <div>
    <v-card v-if="labelDates.length > 0" class="pa-4">
      <v-card-title>Chart geografic areas tweets</v-card-title>

      <v-select
          :items="Object.keys(tweetsCountry)"
          v-model="selectedState"
          label="Select a state to see the chart"
          dense
          outlined
      ></v-select>
      <p>{{tweetsCountry}}</p>
      <p>{{ChartData}}</p>
      <p>{{labelDates}}</p>

      <div v-if="selectedState" align="right">
        <v-btn v-if="(slice+7<=labelDates.length) || (slice>0 && slice<labelDates.length)"
               @click="seeMore()"
        >
          See most recents informations
          <v-icon right>mdi-arrow-right-drop-circle-outline</v-icon>
        </v-btn>
        <line-chart :selected-state="selectedState" :chart-data="ChartData"></line-chart>
      </div>
    </v-card>
    <v-card>
      <v-card-title>Chart words frequency</v-card-title>
      <bar-chart></bar-chart>
    </v-card>
  </div>
</template>

<script>
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import exampletweets from "../../repositories/context/ama/collection.json";

export default {
  name: "Analytics",

  components:{
    LineChart,
    BarChart
  },

  props: {
    selectedSample: Array,
  },

  data: () => ({

    tweets: exampletweets,
    labelDates:[],
    tweetsCountry: {},
    ChartData: [],
    selectedState:"",
    slice: 0
  }),


  watch: {
    selectedSample: function (newVal) {
      this.tweets = newVal;
      this.tweetsCountry = this.addCountriesData();
    },

    slice: function (){
      this.ChartData = this.createDatasets();
    },

    selectedState: function (newVal){
      this.selectedState = newVal;
      this.ChartData = this.createDatasets();
      this.slice = 0; //Ricomincio dall'inizio
    }

  },

  created() {
    this.tweetsCountry = this.addCountriesData();
  },

  methods: {

    //FUNZIONANTE
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

    createDatasets:function(){
      //Solo qui l'array mi serve splittato quindi lo creo qui, parto da slice e fino ad altri 7
      let regions = Object.keys(this.tweetsCountry[this.selectedState]);
      let datasets = [];
      let sliceDates = this.labelDates.slice(this.slice,this.slice+7);

      for(let region of regions) {
        let tweetsXDay = this.setTweetsXDay(region, sliceDates); //Da passare lo slice
        let randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
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

    //UTILI
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
      let tweetsXDay = new Array();
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

    seeMore: function (){
      if(this.slice+7 <= this.labelDates.length) this.slice += 7;
      else if(this.slice > 0 && this.slice< this.labelDates.length){
        let difference = this.labelDates.length - this.slice;
        this.slice += difference;
      }
    }
  }
}
</script>

<style scoped>

</style>