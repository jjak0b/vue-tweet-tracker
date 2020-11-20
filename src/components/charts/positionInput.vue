<template>
  <div>
    <v-row>
      <v-col>
        <places
            placeholder="Search location"
            @change="onChange"
        ></places>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <GmapMap
            :center="computedCenter"
            :zoom="7"
            style="width: 100%; height: 300px"
            @click="$emit('add-rectangle', $event.latLng)">
          <gmap-rectangle
                        v-for="(rectangle, index) in rectangles"
                        :key="index"
                        :bounds="rectangle"
                        :editable="true"
                        :draggable="true"
                        @bounds_changed="$emit('update-rectangle', $event, index)"
                        @rightclick="$emit('delete-rectangle', $event, index)"
                        @click="$emit('add-rectangle', $event.latLng)">>
          </gmap-rectangle>
        </GmapMap>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pa-0">
        <v-btn
            text
            color="error"
            class="float-right"
            @click="$emit('reset-rectangles')"
        >
          Reset
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
//import Position from "@/js/Position";
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import Places from 'vue-places'

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_EXTERNAL_GOOGLE_MAPS_API_KEY || "",
    libraries: 'places', // This is required if you use the Autocomplete plugin
    // OR: libraries: 'places,drawing'
    // OR: libraries: 'places,drawing,visualization'
    // (as you require)
    language: navigator.language,
  },
  installComponents: true
});

export default {
  name: "Map",
  components: {
    Places
  },
  props: {
    rectangles: Array
  },
  computed: {
    computedCenter: function () { return this.center ? this.center : {lat: 41.9028, lng: 12.4964} }
  },
  data() {
    return {
      center: null
    }
  },
  methods: {
    onChange( location ) {
      this.center = location.latlng;
    }
  }
}
</script>

<style scoped>

</style>