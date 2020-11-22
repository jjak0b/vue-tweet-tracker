<template>
  <div v-if="selectedSample">
    <v-container>
      <v-row>
        <v-col>
          <WordCloud
              :samples="selectedSample.slice(0, 10)"
          >
          </WordCloud>
        </v-col>
        <v-col>
          <v-card
              height="25rem"
          >
            <Map
                :center-position="centerPosition"
                :samples="selectedSample"
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
                    v-for="item in selectedSample"
                    :key="item.data.id"
                >
                  <v-list-item-content>
                    <v-list-item-title v-text="item.data.text"></v-list-item-title>
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
              <v-toolbar-title class="font-weight-bold text-h6">Selected Tweet</v-toolbar-title><v-spacer></v-spacer>
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
                  <h4>ID</h4>
                  <p>{{ this.selectedTweet.data.id }}</p>
                  <h4>Language</h4>
                  <p>{{ language[this.selectedTweet.data.lang] }}</p>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header class="font-weight-medium text-body-1">User</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-row>
                    <v-col>
                      <h4>ID</h4>
                      <p>{{ this.selectedTweet.data.author_id }}</p>
                      <h4>Name</h4>
                      <p>{{ this.selectedTweet.users.username }}</p>
                      <h4>Screen name</h4>
                      <p>{{ this.selectedTweet.users.name }}</p>
                      <div v-if="selectedTweet.users.location">
                        <h4>Location</h4>
                        <p>{{ this.selectedTweet.users.location }}</p>
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
              <v-expansion-panel>
                <v-expansion-panel-header class="font-weight-medium text-body-1">Engagement</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <h4>Likes</h4>
                  <p>{{ this.selectedTweet.data.public_metrics.like_count }}</p>
                  <h4>Replies</h4>
                  <p>{{ this.selectedTweet.data.public_metrics.reply_count }}</p>
                  <h4>Retweets</h4>
                  <p>{{ this.selectedTweet.data.public_metrics.retweet_count }}</p>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel v-if="selectedTweet.places">
                <v-expansion-panel-header class="font-weight-medium text-body-1">Location</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <h4>Country</h4>
                  <p>{{ this.selectedTweet.places.country }}</p>
                  <h4>Place</h4>
                  <p>{{ this.selectedTweet.places.full_name }}</p></v-expansion-panel-content>
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
  </div>
</template>

<script>
import {Tweet} from 'vue-tweet-embed'
import language from "@/assets/language.json"
import WordCloud from "@/components/charts/WordCloud";
import Map from "@/components/charts/Map";
import Position from "@/js/Position";
import ImageWindow from "@/components/charts/ImageWindow";
import axios from "axios";

export default {

  name: "Dashboard",
  props: {
    selectedSample: Array
  },
  components: {
    ImageWindow,
    WordCloud,
    Map,
    Tweet
  },
  computed: {

    isSelected() {
      return this.selectedTweetIndex || this.selectedTweetIndex === 0
    },
    selectedTweet: function () {
      return this.isSelected ? this.selectedSample[this.selectedTweetIndex] : null
    }
  },
  data: () => ({
    tweets: [],
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