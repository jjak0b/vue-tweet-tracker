<template>
  <v-container>
    <v-row v-for=" in selectedSample" >

    </v-row>
  </v-container>
</template>

<script>
import json from "../../backend/repositories/testMultipleImmagini.json"
import axios from "axios";

export default {
  name: "Gallery",
  props: {
    selectedSample: String
  },

  data: () => ({
    tweets: json,
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
}
</script>

<style scoped>

</style>