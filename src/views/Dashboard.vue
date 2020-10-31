<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-card>
          <v-card-title>Tweets</v-card-title>
          <v-list dense rounded>
            <v-list-item-group
                v-model="selectedTweetIndex"
                color="primary">
              <v-list-item
                  v-for="item in tweetNames"
                  :key="item"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.author"></v-list-item-subtitle>
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
          </v-toolbar>
          <v-expansion-panels accordion>
            <v-expansion-panel>
              <v-expansion-panel-header class="font-weight-medium text-body-1">Tweet</v-expansion-panel-header>
              <v-expansion-panel-content>
                <Tweet
                    class="mb-7"
                    :id="this.selectedTweet.id_str"
                    :key="this.selectedTweet.id_str">
                  <v-skeleton-loader
                      width="500"
                      type="card"
                  ></v-skeleton-loader>
                </Tweet>
                <h4>Created at</h4>
                <p>{{ getDateString(this.selectedTweet.created_at) }}</p>
                <h4>Language</h4>
                <p>{{ language[this.selectedTweet.metadata.iso_language_code] }}</p>
                <h4>Text</h4>
                <p>{{ this.selectedTweet.text }}</p>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header class="font-weight-medium text-body-1">User</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="1">
                    <v-avatar>
                      <v-img :src="this.selectedTweet.user.profile_image_url"></v-img>
                    </v-avatar>
                  </v-col>
                  <v-col>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-bold">{{
                            this.selectedTweet.user.name
                          }}
                        </v-list-item-title>
                        <v-list-item-subtitle>{{ '@' + this.selectedTweet.user.screen_name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <h4>Name</h4>
                    <p>{{ this.selectedTweet.user.name }}</p>
                    <h4>Screen name</h4>
                    <p>{{ this.selectedTweet.user.screen_name }}</p>
                    <div v-if="selectedTweet.user.description">
                      <h4>Description</h4>
                      <p>{{ this.selectedTweet.user.description }}</p>
                    </div>
                    <h4>Created at</h4>
                    <p>{{ getDateString(this.selectedTweet.user.created_at) }}</p>
                  </v-col>
                  <v-col>
                    <h4>Following</h4>
                    <p>{{ this.selectedTweet.user.friends_count }}</p>
                    <h4>Followers</h4>
                    <p>{{ this.selectedTweet.user.followers_count }}</p>
                    <h4>Number of Tweets</h4>
                    <p>{{ this.selectedTweet.user.statuses_count }}</p>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel v-if="selectedTweet.place">
              <v-expansion-panel-header class="font-weight-medium text-body-1">Location</v-expansion-panel-header>
              <v-expansion-panel-content>
                <h4>Country</h4>
                <p>{{ this.selectedTweet.place.country }}</p>
                <h4>Place</h4>
                <p>{{ this.selectedTweet.place.full_name }}</p>
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
import json from "../../repositories/tweets.json"
import language from "@/assets/language.json"

export default {

  name: "Dashboard",
  components: {
    "Tweet": Tweet
  },
  computed: {
    tweetNames: function () {
      let tweets = [];
      for (const tweet of this.tweets.statuses) {
        tweets.push({
          name: this.getSubString(tweet.text),
          author: '@' + tweet.user.screen_name
        })

      }
      return tweets
    },
    isSelected() {
      return this.selectedTweetIndex || this.selectedTweetIndex === 0
    },
    selectedTweet: function () {
      return this.isSelected ? this.tweets.statuses[this.selectedTweetIndex] : null
    }
  },
  data: () => ({
    showLocation: false,
    showTweet: false,
    showUser: false,
    language: language,
    tweets: json,
    selectedTweetIndex: null
  }),
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