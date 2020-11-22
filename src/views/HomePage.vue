<template>
  <v-app>
    <div id="home_back">
     <v-container>
      <v-row id="first_row">
        <v-img
            src="@/assets/img/titolo1.png"
            contain
        >
        </v-img>
      </v-row>

      <v-spacer> </v-spacer>

      <v-row id="second_row"
          align="center"
          justify="space-around"
      >

        <v-btn
            id="btn_CreaC"
            tile
            dark
            large
            color="indigo"
            to="app/filter"
        >
          <v-icon left>
            mdi-plus
          </v-icon>

          New Sample

        </v-btn>

        <v-btn
            id="btn_ListaC"
            tile
            dark
            large
            color="indigo"
            to="/app/dashboard"
        >
          <v-icon left>
            mdi-format-list-bulleted-square
          </v-icon>

          Samples List

        </v-btn>

      </v-row>
     </v-container>
    </div>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
  }),
};
</script>
