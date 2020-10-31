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
          v-for="(m, index) in markers"
          :key="'marker_'+index"
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
    this.updateCenter( this.centerPosition );
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
      let position = null;
      samples.forEach( (sample) => {
        position = null;
        let isGeoInData = sample.data && sample.data.geo && sample.data.geo.coordinates;
        let isGeoInPlaces = sample.places && sample.places.geo && sample.places.geo.bbox;
        if( isGeoInData ) {
          let geo = sample.data.geo;
          position = new Marker(
              geo.coordinates.coordinates[ 1 ],
              geo.coordinates.coordinates[ 0 ],
              sample.data.text
          );
        }
        else if( isGeoInPlaces ){
          let geo = sample.places.geo;
          position = new Marker(
              (geo.bbox[ 1 ] + geo.bbox[ 3 ]) / 2.0,
              (geo.bbox[ 0 ] + geo.bbox[ 2 ]) / 2.0,
              sample.data.text
          );
        }

        if( position )
          markers.push( position );
      });
      return markers;
    }
  }
}

</script>

<style scoped>

</style>