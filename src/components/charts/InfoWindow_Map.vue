<template>
  <v-container>
    <div>
      <Tweet v-if="selectedWindow === 1"
             :id = "selectedInfoTweet.data.id"
             :key ="selectedInfoTweet.data.id"
      >
        <v-skeleton-loader
            width="10rem"
            type="card"
        ></v-skeleton-loader>
      </Tweet>

      <v-carousel v-if="selectedInfoTweet.media && selectedWindow === 2">
        <v-carousel-item
            v-for="(item,i) in selectedInfoTweet.media"
            :key="i"
            :src="item.url"
            reverse-transition="fade-transition"
            transition="fade-transition"
        >
          <v-btn
              fab
              dark
              small
              color="pink"
              class="ma-2"
              @click="markImage(item.url)"
          >
            <v-icon dark small>
              mdi-pin
            </v-icon>
          </v-btn>
        </v-carousel-item>
        <v-skeleton-loader
            width="10rem"
            type="card"
        ></v-skeleton-loader>
      </v-carousel>
    </div>

    <v-footer absolute>
      <v-btn
          fab
          color="primary"
          dark
          bottom
          fixed
          left
          small
             @click="footerBtnFunction"
      >
        <v-icon dark small v-if="selectedWindow === 1">
          mdi-arrow-right-thick
        </v-icon>
        <v-icon dark small v-if="selectedWindow === 2">
          mdi-arrow-left-thick
        </v-icon>
      </v-btn>
    </v-footer>
  </v-container>
</template>

<script>
import {Tweet} from 'vue-tweet-embed';

export default {
  name: "InfoWindow_Map",
  props: {
    selectedInfoTweet: Array,
    //ImageMarked: Boolean
  },

  components: {
    Tweet
  },

  data(){
    return{
      markedImageUrl: undefined,
      selectedWindow: 1,
    }
  },

  methods: {
    footerBtnFunction(){
        if(this.selectedWindow === 1){
          this.selectedWindow = 2;
        }
        else if(this.selectedWindow === 2){
          this.selectedWindow = 1;
        }
    },

    markImage(url){
      this.markedImageUrl = url;
      this.$emit("input", url);
    }
  }
}
</script>

<style scoped>

</style>