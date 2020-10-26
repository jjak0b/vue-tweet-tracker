<template>
  <v-app>
    <div id="home_back">
     <v-container>
      <v-row id="first_row">
        <v-img
            src="./assets/img/titolo1.png"
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
            outlined
            color="indigo"
        >
          Crea Evento
        </v-btn>

        <v-btn
            outlined
            color="indigo"
        >
          Nuovo Campionamento
        </v-btn>

        <v-btn
            outlined
            color="indigo"
        >
          Lista Campionamenti
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
