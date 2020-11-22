<template>
  <v-container>
  <v-row v-for="(mediaList, id) in places" v-bind:key="id" >
    <v-row>
      <v-col>
      <p>{{id}}</p>
        <v-row>
          <v-col
              v-for="(media) in mediaList"
              :key="media.url"
              class="d-flex child-flex"
              cols="4"
          >
            <v-img
                :src="media.url"
                aspect-ratio="1"
                class="grey lighten-2"
            >
              <template v-slot:placeholder>
                <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                >
                  <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-row>
  </v-container>
</template>

<script>
import json from "../../backend/repositories/testMultipleImmagini.json"
import axios from "axios";

export default {
  name: "Gallery",
  props: {
    selectedSample: String
  },

  data: () => ({
      tweets: json,
      places: {}
    }),

  watch: {

    selectedSample: function (newVal) {
      if ( newVal && newVal.length > 0 ) {
        axios.get('/api/samples/' + newVal)
            .then( (response) => {
              this.tweets = response.data;
            })
            .catch( (error) => {
              console.error("ERROR", error);
            })
      }
    }
  },

  created() {
    this.places = this.getPlaces();
  },

  methods: {
    getPlaces:function(){
      /**
       *
       * @type {Map<String, []>}
       */
      let places = new Map();

      for (let tweet of this.tweets){
        if(tweet.media ){
          let place = null;
          if(tweet.places.full_name){
            place = tweet.places.full_name;
          }
          else if(tweet.users.location){
            place = tweet.users.location;
          }

          if( place ) {
            if( !places.has( place ) ) {
              places.set( place, [] );
            }
            places.get(place).push( ...tweet.media );
          }
        }
      }
      return Object.fromEntries( places );
    }
  }
}
</script>

<style scoped>

</style>