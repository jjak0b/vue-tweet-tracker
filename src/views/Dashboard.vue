<template>
  <div v-if="filteredSample">
    <v-container>
      <v-row>
        <v-col>
          <WordCloud
              :samples="filteredSample.slice(0,10)"
              @input="localFilter.words.all.push($event);filterSample()"
          >
          </WordCloud>
        </v-col>
        <v-col>
          <v-card
              height="25rem"
          >
            <Map
                :center-position="centerPosition"
                :samples="filteredSample"
            ></Map>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <v-row no-gutters>
            <v-dialog
                v-model="showLocalFilter"
                max-width="1200"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="primary"
                    v-bind="attrs"
                    v-on="on"
                >
                  Filter
                </v-btn>
              </template>
              <local-filter
                  :filter="localFilter"
                  @submit="onSubmitLocalFilter"
              ></local-filter>
            </v-dialog>
            <v-btn
                class="ml-2"
                color="red"
                dark
                @click="resetLocalFilter"
            >
              reset
            </v-btn>
          </v-row>
          <v-row no-gutters class="mt-2">
            <v-col>
              <v-card>
                <v-card-title>Tweets</v-card-title>
                <v-list dense rounded>
                  <v-list-item-group
                      id="list-tweet"
                      v-model="selectedTweetIndex"
                      color="primary"
                  >
                    <v-list-item
                        v-for="(item, index) in filteredSample"
                        :key="index"
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
          </v-row>
        </v-col>
        <v-col v-if="isSelected" cols="7">
          <v-card>
            <v-toolbar color="blue" dark>
              <v-toolbar-title class="font-weight-bold text-h6">Selected Tweet</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-expansion-panels accordion>
              <v-expansion-panel>
                <v-expansion-panel-header class="font-weight-medium text-body-1">Tweet</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <Tweet
                      class="mb-7"
                      :id="selectedTweet.data.id"
                      :key="'tweet'+ selectedTweet.data.id">
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
              <v-expansion-panel v-if="isGeoInPlaces || isGeoInData">
                <v-expansion-panel-header class="font-weight-medium text-body-1">Location</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-responsive :min-height="300">
                    <Map
                        :center-position="selectedPosition"
                        :samples="[selectedTweet]"
                    ></Map>
                  </v-responsive>
                  <div v-if="isGeoInPlaces">
                    <h4 class="mt-3">Country</h4>
                    <p>{{ this.selectedTweet.places.country }}</p>
                    <h4>Place</h4>
                    <p>{{ this.selectedTweet.places.full_name }}</p>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel v-if="thereAreImages(selectedTweet)">
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
import localFilter from "@/components/localFilter";
import Filter from "@/js/Filter";

export default {

  name: "Dashboard",
  props: {
    selectedSample: Array
  },
  components: {
    ImageWindow,
    WordCloud,
    Map,
    Tweet,
    localFilter
  },
  computed: {
    isSelected() {
      return this.selectedTweetIndex || this.selectedTweetIndex === 0
    },
    selectedTweet: function () {
      return this.isSelected ? this.filteredSample[this.selectedTweetIndex] : null
    },
    isGeoInData: function () {
      return (this.selectedTweet && this.selectedTweet.data && this.selectedTweet.data.geo &&
          this.selectedTweet.data.geo.coordinates && this.selectedTweet.data.geo.coordinates.coordinates)
    },
    isGeoInPlaces: function () {
      return (this.selectedTweet && this.selectedTweet.places &&
          this.selectedTweet.places.geo && this.selectedTweet.places.geo.bbox)
    },
    selectedPosition: function () {
      if (this.selectedTweet) {
        let coordinates;
        if (this.isGeoInData) {
          let coordinates = this.selectedTweet.data.geo.coordinates.coordinates;
          return new Position(coordinates[1], coordinates[0])
        } else if (this.isGeoInPlaces) {
          coordinates = this.selectedTweet.places.geo.bbox;
          return new Position(
              (coordinates[1] + coordinates[3]) / 2.0,
              (coordinates[0] + coordinates[2]) / 2.0
          )
        }
      }
      return this.centerPosition
    }
  },
  watch: {
    selectedSample: function (newVal) {
      this.filteredSample = newVal;
      this.localFilter = new Filter();
    }
  },
  methods: {
    onSubmitLocalFilter() {
      this.showLocalFilter = false;
      this.filterSample();
    },
    resetLocalFilter() {
      this.filteredSample = this.selectedSample;
    },
    filterSample() {
      if (!this.localFilter) return;
      this.filteredSample = this.selectedSample;

      if (this.localFilter.accounts.from.length > 0) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          for (const word of this.localFilter.accounts.from) {
            if (word === tweet.users.username) return true
          }
          return false
        })
      }
      if (this.localFilter.accounts.from.length > 0) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          for (const word of this.localFilter.accounts.from) {
            if (word === tweet.users.username) return true
          }
          return false
        })
      }
      if (this.localFilter.accounts.mentioning.length > 0) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          for (const word of this.localFilter.accounts.mentioning) {
            if (tweet.data.entities && tweet.data.entities.mentions) {
              for (const mention of tweet.data.entities.mentions) {
                if (mention.username === word) return true
              }
            }
          }
          return false
        })
      }
      if (this.localFilter.words.language) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (tweet.data.lang === this.localFilter.words.language);
        })
      }
      let nord, sud, est, ovest;
      let point = {lat: null, long: null};
      let bbox = {nord: null, sud: null, est: null, ovest: null};
      for (const coord of this.localFilter.coordinates) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          ovest = coord[0][0] + 180;
          nord = coord[0][1] + 90;
          est = coord[1][0] + 180;
          sud = coord[1][1] + 90;
          if (tweet.data.geo && tweet.data.geo.coordinates) {
            point.lat = tweet.data.geo.coordinates.coordinates[1] + 90;
            point.long = tweet.data.geo.coordinates.coordinates[0] + 180;
            if (ovest <= point.long && point.long <= est && sud <= point.lat && point.lat <= nord) {
              return true
            }
          } else if (tweet.places && tweet.places.geo) {
            bbox.ovest = tweet.places.geo.bbox[0] + 180;
            bbox.sud = tweet.places.geo.bbox[1] + 90;
            bbox.est = tweet.places.geo.bbox[2] + 180;
            bbox.nord = tweet.places.geo.bbox[3] + 90;
            if (ovest < bbox.est && bbox.ovest < est && sud < bbox.nord && bbox.sud < nord) {
              return true
            }
          }
          return false
        })
      }
      if (this.localFilter.dates.from) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (Date.parse(this.localFilter.dates.from) < Date.parse(tweet.data.created_at));
        })
      }
      if (this.localFilter.dates.to) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (Date.parse(this.localFilter.dates.to + 'T23:59:59') > Date.parse(tweet.data.created_at));
        })
      }
      for (const word of this.localFilter.words.hashtags) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (tweet.data.text.includes('#' + word));
        })
      }
      for (const word of this.localFilter.words.exact) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (tweet.data.text.includes(word));
        })
      }
      for (const word of this.localFilter.words.none) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (!tweet.data.text.toLowerCase().includes(word.toLowerCase()));
        })
      }
      if (this.localFilter.words.any.length > 0) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          for (const word of this.localFilter.words.any) {
            if (tweet.data.text.toLowerCase().includes(word.toLowerCase())) return true
          }
          return false
        })
      }
      for (const word of this.localFilter.words.all) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          return (tweet.data.text.toLowerCase().includes(word.toLowerCase()));
        })
      }
      if (this.localFilter.context.entities.length > 0) {
        this.filteredSample = this.filteredSample.filter((tweet) => {
          for (const word of this.localFilter.context.entities) {
            if (tweet.data.context_annotations) {
              for (const context of tweet.data.context_annotations) {
                if (context.entity.name.toLowerCase() === word.toLowerCase()) return true
              }
            }
          }
          return false
        })
      }
    },
    getDateString(value) {
      const date = new Date(value);
      return date.toLocaleString('en-US');
    },
    thereAreImages(tweet) {
      if (tweet.media && tweet.media.some((media) =>
          media.type === 'photo')) {
        return true
      } else {
        return false
      }
    }
  },
  data: () => ({
    localFilter: new Filter(),
    showLocalFilter: false,
    filteredSample: null,
    selectedTweetIndex: null,
    centerPosition: new Position(41.902782, 12.496366),// Rome
    showLocation: false,
    language: language
  })
}
</script>

<style scoped>
#list-tweet {
  height: 25rem;
  overflow-y: auto;
}
</style>