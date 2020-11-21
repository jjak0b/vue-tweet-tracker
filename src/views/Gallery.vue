<template>
  <v-container>
  <v-row v-for="item in places" v-bind:key="item.id" >
    <v-row>
      <v-col>
      <p>{{item.id}}</p>
        <v-row>
          <v-col
              v-for="(media,i) in item.media"
              :key="i"
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
      places: []
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
    this.places = this.setPlaces();
  },

  methods: {
    setPlaces:function(){
      let located_tweet = [];
      let alreadyAdded = false;

      for (let tweet of this.tweets){
        if(tweet.media){
          if(tweet.places.full_name){
            for(let place of located_tweet){
              if(tweet.places.full_name == place.id){
                for(let media of tweet.media){
                  place.media.push(media);
                }
                alreadyAdded = true;
              }
            }
            if(!alreadyAdded){
             located_tweet.push(
                  {
                    id: tweet.places.full_name,
                    media: tweet.media
                  }
              );
            }
          }
          else if(tweet.users.location){
            for(let place of located_tweet){
              if(tweet.users.location == place.id){
                place.media.push(tweet.media);
                alreadyAdded = true;
              }
            }
            if(!alreadyAdded){
              located_tweet.push(
                  {
                    id: tweet.users.location,
                    media: tweet.media
                  }
              );
            }
          }
        }
      }
      return located_tweet;
    }
  }
}
</script>

<style scoped>

</style>