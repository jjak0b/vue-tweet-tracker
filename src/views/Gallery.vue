<template>
  <v-container v-if="selectedSample">
    <v-pagination
        v-model="pageIndex"
        :length="pageCount"
        :total-visible="15"
    >
    </v-pagination>
    <div v-if="placesPerPage.length > 0">
      <v-row
          v-for="(id, index) in placesPerPage[pageIndex-1]"
          :key="'place_' + index + '_' + id"
      >
        <v-col>
          <article>
          <h3 v-text="id"></h3>
          <v-row>
            <v-col
                v-for="(media, i ) in places[ id ]"
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
          </article>
        </v-col>
      </v-row>
    </div>
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
    places: {},
    pageIndex: 1,
    pageCount: 0,
    maxPlacesPerPage: 10,
    placeKeys: [],
    pagePlaceKeys: [],
    notGeoTaggedPlaceID: "Not geotagged",
    placesPerPage: []
  }),

  watch: {
    selectedSample: function (newVal) {
      this.pageIndex = 1;
      this.pageCount = 0;
      this.tweets = newVal || [];
      this.places = this.getPlaces();
    },
    places() {

      this.placeKeys = Object.keys( this.places );
      let index = this.placeKeys.indexOf( this.notGeoTaggedPlaceID );
      // push not geotagged places to end of place names array
      let notGeoTaggedKeys = null;
      if( index >= 0 ) {
        notGeoTaggedKeys = this.placeKeys.splice( index, 1 );
      }
      this.pageCount = Math.ceil(this.placeKeys.length / this.maxPlacesPerPage );

      this.placesPerPage = new Array(this.pageCount + (index >= 0 ? 1 : 0) );
      let i
      for ( i = 0; i < this.pageCount; i++) {
        let startIndex = Math.min ( i * this.maxPlacesPerPage, this.placeKeys.length );
        let endIndex = startIndex + Math.min( this.placeKeys.length - startIndex, this.maxPlacesPerPage );
        this.placesPerPage[ i ] = this.placeKeys.slice( startIndex, endIndex );
      }
      if( notGeoTaggedKeys ) {
        this.placesPerPage[ i ] = notGeoTaggedKeys ;
        this.pageCount++;
      }
    }
  },

  created() {
    this.pageIndex = 1;
    this.pageCount = 0;
    this.tweets = this.selectedSample || [];
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
        // priority = 0;
        // place = null;
        if (tweet.media) {
          if (tweet.places && tweet.places.full_name) {
            place = tweet.places.full_name;
            priority = 2;
          }
          else { // if( tweet.users && tweet.users.location )
            place = this.notGeoTaggedPlaceID; // tweet.users.location;
            priority = 1;
          }

          if (place) {
            console.log( place );
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