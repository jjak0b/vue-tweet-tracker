<template>
  <v-app>
    <v-app-bar app color="blue">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="white--text">Twitter tracker</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text class="white--text mr-2" to="/">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn text class="white--text" to="/filter">
        <v-icon left>mdi-plus-circle</v-icon>
        Create new sample
      </v-btn>
      </v-app-bar>
    <v-navigation-drawer app v-model="drawer" bottom>
      <h3 class="pa-3">Samples List</h3>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item link v-for="item in samplesList" :key="item">
          <v-list-item-content>
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="grey lighten-3">
      <v-container fluid>
        <router-view/>
      </v-container>
    </v-main>
  </v-app>
</template>


<script>

export default {
  name: 'App',

  data: () => ({
    drawer: true,
    samplesList: ["sample 1", "sample 2", "sample 3"]
  }),
};
</script>
