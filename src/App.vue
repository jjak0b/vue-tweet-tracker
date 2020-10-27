<template>
  <v-app>
    <v-system-bar app color="blue"></v-system-bar>
    <v-navigation-drawer app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Twitter tracker
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item link to="/">
          <v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/filter">
          <v-list-item-icon><v-icon>mdi-plus-circle</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>New sample</v-list-item-title>
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

  }),
};
</script>
