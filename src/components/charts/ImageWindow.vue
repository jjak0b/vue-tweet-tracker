<template>
    <v-carousel>
      <v-carousel-item
          v-for="(item,i) in selectedTweet.media"
          :key="i"
          :src="item.url"
          reverse-transition="fade-transition"
          transition="fade-transition"
      ></v-carousel-item>
    </v-carousel>
</template>

<script>

export default {
  name: "ImageWindow",

  props: {
    selectedTweet: Array,
  },
}
</script>

<style scoped>

</style>