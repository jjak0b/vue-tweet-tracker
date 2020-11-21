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
          :icon="m.icon"
          @click="selectedMarker=center=m"

      >

        <GmapInfoWindow

            :key="m.reference.data.id"
            v-if="selectedMarker === m"
        >
            <InfoWindow_Map
               :selected-info-tweet="m.reference"
            >
            </InfoWindow_Map>
        </GmapInfoWindow>
      </GmapMarker>
    </GmapMap>
  </v-card>
</template>

<script>
import Position from "@/js/Position";
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import InfoWindow_Map from "@/components/charts/InfoWindow_Map";
//import ImageWindow from "@/components/charts/ImageWindow";
//import {Tweet} from 'vue-tweet-embed';

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

  static icons = {
    Point: null,
    Feature: {
      url: require( "../../assets/img/markers/marker-area-location-icon.png" ),
      scaledSize: {width: 28, height: 42},
    }
  };

  constructor(
      /*double*/ latitude,
      /*double*/ longitude,
      /*String*/ type,
      /*Object*/ reference
  ) {
    super( latitude, longitude );

    this.type = type;
    this.reference = reference;
  }

  get icon() {
    return this.type && (this.type in Marker.icons) ?  Marker.icons[ this.type ] : null;
  }

}

export default {
  name: "Map",
  components: {InfoWindow_Map},
  /*components: {
    ImageWindow,
    Tweet
  }, */
  props: {
    samples: Array,
    centerPosition: Position
  },
  data() {
    return {
      markers: [],
      center: undefined,
      selectedMarker: null,
    }
  },
  watch: {
    selectedMaker: function (newMarker) {
      this.$emit("input", newMarker.reference );
    },
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
              geo.coordinates.type,
              sample
          );
        }
        else if( isGeoInPlaces ){
          let geo = sample.places.geo;
          position = new Marker(
              (geo.bbox[ 1 ] + geo.bbox[ 3 ]) / 2.0,
              (geo.bbox[ 0 ] + geo.bbox[ 2 ]) / 2.0,
              geo.type,
              sample
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