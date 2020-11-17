<template>
  <v-container>
    <v-row>
      <v-col>
        <WordCloud
            :samples="tweets"
        >
        </WordCloud>
      </v-col>
      <v-col>
        <v-card
           height="25rem"
        >
          <Map
              :center-position="centerPosition"
              :samples="tweets"
          ></Map>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-card>
          <v-card-title>Tweets</v-card-title>
          <v-list dense rounded>
            <v-list-item-group
                id="list-tweet"
                v-model="selectedTweetIndex"
                color="primary"
            >
              <v-list-item
                  v-for="item in tweets"
                  :key="item.data.id"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="getSubString( item.data.text )"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.users.name"></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <v-col v-if="isSelected" cols="7">
        <v-card>
          <v-toolbar color="blue" dark>
            <v-toolbar-title class="font-weight-bold text-h6">Selected Tweet</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon v-if="isThereMediaPosition" dark>
              <v-icon>mdi-pin</v-icon>
            </v-btn>
          </v-toolbar>
          <v-expansion-panels accordion>
            <v-expansion-panel>
              <v-expansion-panel-header class="font-weight-medium text-body-1">Tweet</v-expansion-panel-header>
              <v-expansion-panel-content>
                <Tweet
                    class="mb-7"
                    :id="selectedTweet.data.id"
                    :key="selectedTweet.data.id">
                  <v-skeleton-loader
                      width="100%"
                      type="card"
                  ></v-skeleton-loader>
                </Tweet>
                <h4>Created at</h4>
                <p>{{ getDateString(this.selectedTweet.data.created_at) }}</p>
                <h4>Language</h4>
                <p>{{ language[this.selectedTweet.data.lang] }}</p>
                <h4>Text</h4>
                <p>{{ this.selectedTweet.data.text }}</p>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header class="font-weight-medium text-body-1">User</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="1">
                    <v-avatar>
                      <v-img :src="this.selectedTweet.users.profile_image_url"></v-img>
                    </v-avatar>
                  </v-col>
                  <v-col>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-bold">{{
                            this.selectedTweet.users.name
                          }}
                        </v-list-item-title>
                        <v-list-item-subtitle>{{ '@' + this.selectedTweet.users.name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <h4>Name</h4>
                    <p>{{ this.selectedTweet.users.username }}</p>
                    <h4>Screen name</h4>
                    <p>{{ this.selectedTweet.users.name }}</p>
                    <div v-if="selectedTweet.users.description">
                      <h4>Description</h4>
                      <p>{{ this.selectedTweet.users.description }}</p>
                    </div>
                    <h4>Created at</h4>
                    <p>{{ getDateString(this.selectedTweet.users.created_at) }}</p>
                  </v-col>
                  <v-col v-if="selectedTweet.users.public_metrics">
                    <h4>Following</h4>
                    <p>{{ selectedTweet.users.public_metrics.following_count }}</p>
                    <h4>Followers</h4>
                    <p>{{ selectedTweet.users.public_metrics.followers_count }}</p>
                    <h4>Number of Tweets</h4>
                    <p>{{ selectedTweet.users.public_metrics.tweet_count }}</p>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel v-if="selectedTweet.places">
              <v-expansion-panel-header class="font-weight-medium text-body-1">Location</v-expansion-panel-header>
              <v-expansion-panel-content>
                <h4>Country</h4>
                <p>{{ this.selectedTweet.places.country }}</p>
                <h4>Place</h4>
                <p>{{ this.selectedTweet.places.full_name }}</p>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel v-if="selectedTweet.media">
              <v-expansion-panel-header class="font-weight-medium text-body-1">Media</v-expansion-panel-header>
              <v-expansion-panel-content>
                  <ImageWindow
                      :selected-tweet="selectedTweet"
                  ></ImageWindow>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {Tweet} from 'vue-tweet-embed'
import json from "../../backend/repositories/testMultipleImmagini.json"
import language from "@/assets/language.json"
import WordCloud from "@/components/charts/WordCloud";
import Map from "@/components/charts/Map";
import Position from "@/js/Position";
import ImageWindow from "@/components/charts/ImageWindow";
import axios from "axios";

export default {

  name: "Dashboard",
  props: {
    selectedSample: String
  },
  components: {
    ImageWindow,
    WordCloud,
    Map,
    Tweet
  },
  computed: {
    tweetNames: function () {
      let tweets = [];
      for (const tweet of this.tweets) {
        tweets.push({
          name: this.getSubString(tweet.text),
          author: '@' + tweet.users.username
        })

      }
      return tweets
    },
    isSelected() {
      return this.selectedTweetIndex || this.selectedTweetIndex === 0
    },
    selectedTweet: function () {
      return this.isSelected ? this.tweets[this.selectedTweetIndex] : null
    },

    isThereMediaPosition: function(){
      let selTweet = this.selectedTweet;
      let isGeo = selTweet.data && selTweet.data.geo && selTweet.data.geo.coordinates || selTweet.places && selTweet.places.geo && selTweet.places.geo.bbox;
      return isGeo && selTweet.media
    }

  },
  data: () => ({
    tweets: json,
    centerPosition: new Position( 41.902782,12.496366 ),// Rome
    showLocation: false,
    showTweet: false,
    showUser: false,
    language: language,
    selectedTweetIndex: null
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
  methods: {
    getSubString(string) {
      const substring = string.substring(0, 50);
      if (string.length > substring.length) {
        return substring + ' ...'
      }
      return substring;
    },
    getDateString(value) {
      const date = new Date(value);
      return date.toLocaleString('en-US');
    }
  }
}
</script>

<style scoped>
#list-tweet {
  height: 25rem;
  overflow-y: auto;
}
</style>