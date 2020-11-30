<template>
  <v-container v-if="selectedSample">
    <v-row v-for="(mediaList, id) in places" v-bind:key="id">
      <v-row>
        <v-col>
          <p>{{ id }}</p>
          <v-row>
            <v-col
                v-for="(media, i ) in mediaList"
                :key="id + '_' + i + '_' + media.media_key"
                class="d-flex child-flex"
                cols="4"
            >
              <v-img
                  :src="media.url || media.preview_image_url"
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

export default {
  name: "Gallery",
  props: {
    selectedSample: Array,
  },
  data: () => ({
    tweets: [],
    places: {}
  }),

  watch: {
    selectedSample: function (newVal) {
      this.tweets = newVal;
      this.places = this.getPlaces();
    }
  },

  created() {
    this.tweets = this.selectedSample;
    this.places = this.getPlaces();
  },

  methods: {
    getPlaces: function () {
      /**
       *
       * @type {Map<String, []>}
       */
      if (! this.tweets) {
        return null
      }

      let places = new Map();

      let priority;
      let place;
      for (let tweet of this.tweets) {
        priority = 0;
        place = null;
        if (tweet.media) {
          if (tweet.places && tweet.places.full_name) {
            place = tweet.places.full_name;
            priority = 2;
          } else if (tweet.users && tweet.users.location) {
            place = tweet.users.location;
            priority = 1;
          }

          if (place) {
            if (!places.has(place)) {
              places.set(place, []);
            }
            // place first more precise locations
            if (priority > 1)
              places.get(place).unshift(...tweet.media);
            else
              places.get(place).push(...tweet.media);
          }
        }
      }
      return Object.fromEntries(places);
    }
  }
}
</script>

<style scoped>

</style>