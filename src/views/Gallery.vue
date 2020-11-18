<template>
  <v-container>
    <v-row v-for="item in places" v-bind:key="item.id">
      <p>{{item.id}}</p>
      <v-img v-for="(media,i) in item.media"
             :key="i"
             :src="media.url"
             max-height="200px"
             max-width="200px"
      >
      </v-img>
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
      places:[]
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
    this.setPlaces();
  },

  methods: {
    setPlaces:function(){
      let alreadyAdded = false;

      for (let tweet of this.tweets){
        if(tweet.media){
          if(tweet.places.full_name){
            for(let place of this.places){
              if(tweet.places.full_name == place.id){
                for(let media of tweet.media){
                  place.media.push(media);
                }
                alreadyAdded = !alreadyAdded;
              }
            }
            if(!alreadyAdded){
             this.places.push(
                  {
                    id: tweet.places.full_name,
                    media: tweet.media
                  }
              );
            }
          }
          else if(tweet.users.location){
            for(let place of this.places){
              if(tweet.users.location == place.id){
                place.media.push(tweet.media);
                alreadyAdded = !alreadyAdded;
              }
            }
            if(!alreadyAdded){
              this.places.push(
                  {
                    id: tweet.users.location,
                    media: tweet.media
                  }
              );
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>