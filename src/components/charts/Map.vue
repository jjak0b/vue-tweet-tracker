<template>
  <v-card
      width="100%"
      height="100%"
  >
    <GmapMap
        ref="map"
        style="width: 100%; height: 100%"
        :center="center.getPosition()"
        :zoom="6"
        :map-type-id="'roadmap'"
        :map-type-control="false"
        :street-view-control="false"
    >
      <GmapMarker
          :key="index"
          v-for="(m, index) in markers"
          :position="m.getPosition()"
          :clickable="true"
          :draggable="false"
          @click="center=m"
      >
        <!-- Marker window <GmapInfoWindow></GmapInfoWindow>-->
      </GmapMarker>
    </GmapMap>
  </v-card>
</template>

<script>
import Position from "@/js/Position";
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'


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

class MapPosition extends Position {
  constructor(
      /*double*/ latitude,
      /*double*/ longitude,
  ) {
    super( latitude, longitude );
  }
  getPosition() {
    return {
      lat: this.getLatitude(),
      lng: this.getLongitude()
    }
  }
}

class Marker extends MapPosition {
  constructor(
      /*double*/ latitude,
      /*double*/ longitude,
      /*String*/ description
  ) {
    super( latitude, longitude );

    this.description = description;
  }

  getDescription() {
    return this.description;
  }

  setDescription(/*String*/ description) {
    this.description = description;
  }
}

export default {
  name: "Map",
  props: {
    samples: Array,
    centerPosition: Position
  },
  data() {
    return {
      markers: [],
      center: undefined,
    }
  },
  watch: {
    centerPosition: function (newCenter) {
      if( newCenter ) {
        this.updateCenter( newCenter );
      }
    },
    samples: function (samples) {
      if( samples ) {
        this.markers = this.createMarkersForSamples( samples );
      }
      else {
        this.markers = [];
      }
    }
  },
  created() {
    // Rome
    this.updateCenter( new Position( 41.902782,12.496366 ) );
    this.markers = this.createMarkersForSamples( this.samples );
  },
  methods: {
    updateCenter(centerPosition) {
      if( centerPosition ) {
        this.center = new MapPosition( centerPosition.getLatitude(), centerPosition.getLongitude() ) ;
      }
    },
    createMarkersForSamples( samples ) {
      let markers = [];
      if( !samples ) {
        return markers;
      }

      samples.forEach( (sample) => {
        let position = null;
        let sampleData = sample.attributes;
        if( sampleData ) {
          // specific location can be defined
          if( sampleData.geo && sampleData.geo.coordinates ) {
            if( sampleData.geo.coordinates.type == "Point" ) {
              if( sampleData.geo.coordinates.coordinates ) {
                position = new Marker(
                    sampleData.geo.coordinates.coordinates[ 0 ],
                    sampleData.geo.coordinates.coordinates[ 1 ],
                    sampleData.text
                );
              }
            }
          }
          // TODO: else create using bounding box
        }
        if( position )
          markers.push( position );
      });
    }
  }
}

</script>

<style scoped>

</style>