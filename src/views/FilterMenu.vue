<template>
  <v-container>
    <v-form
        ref="form"
        lazy-validation
    >
      <v-row>
        <v-col>
          <v-btn color="primary" class="mr-1" @click="onSubmit">Submit</v-btn>
          <v-btn color="secondary" @click="onReset">Reset</v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header color="blue lighten-4">
                <h3 class="font-weight-medium">Event</h3>
              </v-expansion-panel-header>
              <v-expansion-panel-content color="blue lighten-4" dark>
                <v-row class="justify-start" no-gutters>
                  <v-col cols="2">
                    <v-checkbox label="Notify event" color="secondary" @click="associateEvent"></v-checkbox>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                        v-if="filter.event"
                        :rules="onlyNumbers"
                        v-model.number="filter.event.countRequired"
                        label="Number of required tweet"
                        type="number"
                        required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>

      <v-row class="pa-0">
        <v-col>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header color="blue lighten-4">
              <h3 class="font-weight-medium">Automated posting</h3>
            </v-expansion-panel-header>
            <v-expansion-panel-content color="blue lighten-4">
              <v-row no-gutters>
                <v-col>
                  <v-checkbox
                      v-model="filter.posting.active"
                      label="Post samples automatically"
                  ></v-checkbox>
                </v-col>

                <v-col>
                  <div v-if="filter.posting.active">
                    <h4 class="font-weight-medium">Post frequency</h4>
                    <v-row>
                      <v-col>
                        <v-text-field
                            v-model="filter.posting.frequency.days"
                            type="number"
                            label="days"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                            v-model="filter.posting.frequency.hours"
                            type="number"
                            label="hours"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                            v-model="filter.posting.frequency.minutes"
                            type="number"
                            label="minutes"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
              </v-row>

              <v-row v-if="filter.posting.active" no-gutters>
                <v-col>
                  <h4 class="font-weight-medium">Automated posting duration</h4>
                  <v-row>
                    <v-col>
                      <v-menu
                          v-model="showFromDatePostingMenu"
                          :close-on-content-click="false"
                          min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              :value="filter.posting.from.date"
                              label="From date"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              clearable
                              @click:clear="filter.posting.from.date = null"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="filter.posting.from.date"
                            :max="filter.posting.to.date"
                            @input="showFromDatePostingMenu = false"
                        ></v-date-picker>
                      </v-menu>
                      <v-menu
                          v-model="showFromTimePostingMenu"
                          :close-on-content-click="false"
                          min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              :value="filter.posting.from.time"
                              label="From time"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              clearable
                              @click:clear="filter.posting.from.time = null"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                            light
                            format="ampm"
                            v-model="filter.posting.from.time"
                            :landscape="$vuetify.breakpoint.smAndUp"
                            ampm-in-title
                            @change="showFromTimePostingMenu = false"
                        ></v-time-picker>
                      </v-menu>
                    </v-col>
                    <v-col>
                      <v-menu
                          v-model="showToDatePostingMenu"
                          :close-on-content-click="false"
                          min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              v-model.trim="filter.posting.to.date"
                              label="To date"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              clearable
                              @click:clear="filter.posting.to.date = null"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model.trim="filter.posting.to.date"
                            :min="filter.posting.from.date"
                            @input="showToDatePostingMenu = false"
                        ></v-date-picker>
                      </v-menu>
                      <v-menu
                          v-model="showToTimePostingMenu"
                          :close-on-content-click="false"
                          min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              :value="filter.posting.to.time"
                              label="To time"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              clearable
                              @click:clear="filter.posting.to.time = null"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                            light
                            format="ampm"
                            v-model="filter.posting.to.time"
                            :landscape="$vuetify.breakpoint.smAndUp"
                            @change="showToTimePostingMenu = false"
                            ampm-in-title
                        ></v-time-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </v-col>
      </v-row>
      <!--------------------------------------------------------->

      <v-row>
        <v-col>
          <v-card class="mb-5">
            <v-card-title>Name</v-card-title>
            <v-card-text>
              <v-text-field
                  v-model.trim="name"
                  :key="labels.name.key"
                  :hint="labels.name.hint"
                  :label="labels.name.label"
                  :rules="nameRules"
                  clearable
                  required
              ></v-text-field>
            </v-card-text>
          </v-card>


          <v-card class="mb-5">
            <v-card-title>Words</v-card-title>
            <v-card-text>
              <v-combobox
                  v-for="item in labels.words"
                  v-model.trim="filter.words[item.key]"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
                  multiple
                  chips
                  deletable-chips
              ></v-combobox>
              <v-select
                  v-model="filter.words.language"
                  :items="languageArray"
                  hint="Language"
                  persistent-hint
              ></v-select>
            </v-card-text>
          </v-card>
<!--
          <v-card class="mb-5">
            <v-card-title>Dates</v-card-title>
            <v-card-text>
              <v-menu
                  v-model="showFromDateFilterMenu"
                  :close-on-content-click="false"
                  min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                      :value="filter.dates.from"
                      label="From"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      @click:clear="filter.dates.from = null"
                  ></v-text-field>
                </template>
                <v-date-picker
                    clearable
                    v-model="filter.dates.from"
                    :max="filter.dates.to"
                    @input="showFromTimePostingMenu = false"
                ></v-date-picker>
              </v-menu>
              <v-menu
                  v-model="showToDateFilterMenu"
                  :close-on-content-click="false"
                  min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                      v-model.trim="filter.dates.to"
                      label="To"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      @click:clear="filter.dates.to = null"
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model.trim="filter.dates.to"
                    :min="filter.dates.from"
                    @input="showToDateFilterMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-card-text>
          </v-card>
          -->
        </v-col>

        <v-col>
          <v-card class="mb-5">
            <v-card-title>Position</v-card-title>
            <v-card-text>
              <position-input
                  :rectangles="rectangles"
                  @add-rectangle="addRectangle"
                  @delete-rectangle="deleteRectangle"
                  @update-rectangle="updateRectangle"
                  @reset-rectangles="resetRectangles"
              >
              </position-input>
            </v-card-text>
          </v-card>

          <v-card class="mb-5">
            <v-card-title>Accounts</v-card-title>
            <v-card-text>
              <v-combobox
                  v-for="item in labels.accounts"
                  v-model.trim="filter.accounts[item.key]"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
                  multiple
                  chips
                  deletable-chips
              ></v-combobox>
            </v-card-text>
          </v-card>

          <v-card class="mb-5">
            <v-card-title>Context</v-card-title>
            <v-card-text>
              <v-combobox
                  v-for="item in labels.context"
                  v-model.trim="filter.context[item.key]"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
                  multiple
                  chips
                  deletable-chips
              ></v-combobox>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <v-overlay :value="overlay">
      <v-card align="center" light>
        <div align="right">
          <v-icon small @click="overlay=false" class="ma-3">
            mdi-close-circle-outline
          </v-icon>
        </div>
        <v-card-text class="text--black">Contact the bot telegram to receive notifications of the events that interest
          you
        </v-card-text>
        <v-btn
            rounded
            color="primary"
            dark
            href="https://t.me/tt202014_bot"
            class="ma-2"
        >
          <v-icon dark left>
            mdi-telegram
          </v-icon>
          BOT TELEGRAM
        </v-btn>
      </v-card>
    </v-overlay>

    <v-snackbar
        v-model="snackbar"
    >
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn
            color="red"
            text
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";
import language from "@/assets/language.json"
import { StatusCodes } from 'http-status-codes'
import positionInput from "@/components/charts/positionInput";
import Filter from "@/js/Filter";

export default {
  name: 'FilterMenu',
  components: {
    positionInput
  },
  data: () => ({
    rectangles: [],
    snackbar: false,
    snackbarText: "",
    name: "",
    nameRules: [
      v => !!v || 'Name is required'
    ],
    languageArray: null,
    notify_me: false,
    overlay: false, // Booleano per mostrare pop up con info bot telegram,
    filter: new Filter(),
    showFromTimePostingMenu: false,
    showToTimePostingMenu: false,
    showFromDatePostingMenu: false,
    showToDatePostingMenu: false,
    showFromDateFilterMenu: false,
    showToDateFilterMenu: false,
    labels: {
      name: {
        hint: "Name of the sample",
        label: "Name",
        key: "name"
      },
      words: {
        all: {
          hint: 'Example: what’s happening · contains both “what’s” and “happening”',
          label: "All of these words",
          key: "all"
        },
        exact: {
          hint: 'Example: happy hour · contains the exact phrase “happy hour”',
          label: "This exact phrase",
          key: "exact"
        },
        any: {
          hint: 'Example: cats dogs · contains either “cats” or “dogs” (or both)',
          label: "Any of these words",
          key: "any"
        },
        none: {
          hint: 'Example: cats dogs · does not contain “cats” and does not contain “dogs”',
          label: "None of these words",
          key: "none"
        },
        hashtags: {
          hint: 'Example: #ThrowbackThursday · contains the hashtag #ThrowbackThursday',
          label: "These hashtags",
          key: "hashtags"
        }
      },
      accounts: {
        from: {
          hint: "Example: @Twitter · sent from @Twitter",
          label: "From these accounts",
          key: "from"
        },
        to: {
          hint: "Example: @Twitter · sent in reply to @Twitter",
          label: "To these accounts",
          key: "to"
        },
        mentioning: {
          hint: "Example: @SFBART @Caltrain · mentions @SFBART or mentions @Caltrain",
          label: "Mentioning these accounts",
          key: "mentioning"
        },
      },

      context: {
        entities: {
          hint: "Example: Bologna · Bologna Football Club is related to Bologna",
          label: "Related to this context",
          key: "entities"

        },
      }
    },

    onlyNumbers: [
      value => !!value || 'Required.',
      value => (value >= 1) || 'At least 1',
    ]

  }),
  methods: {
    onSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      axios.put('/api/samples/' + this.name, this.filter)
          .then(() => {
            this.snackbarText = "New sample '" + this.name + "' created."
            this.snackbar = true;
            this.$emit('update-samples');
          })
          .catch((error) => {
            if (error.response.status === StatusCodes.CONFLICT) {
              this.snackbarText = "The filter already exists or the name of the filter is already being used."
              this.snackbar = true;
            } else if ( error.response.status === StatusCodes.INTERNAL_SERVER_ERROR ||
                        error.response.status === StatusCodes.NOT_IMPLEMENTED ) {
              this.snackbarText = "Add more filters."
              this.snackbar = true;
            } else if (error.response.status === StatusCodes.TOO_MANY_REQUESTS) {
              this.snackbarText = "Maximum number of active samples reached. Pause a sample before submitting a new one."
              this.snackbar = true;
            } else if (error.response.status === StatusCodes.NOT_ACCEPTABLE ) {
              this.snackbarText = "Some filters contains invalid values: change them or add other filter fields and try again"
              this.snackbar = true;
            } else if (error.response.status === StatusCodes.BAD_GATEWAY ) {
              this.snackbarText = "Service temporarily unavailable. Try again later"
              this.snackbar = true;
            }
          });
    },
    onReset() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.filter.coordinates = [];
    },
    updateRectangle(event, index) {
      this.$set(this.rectangles, index, event);
      let value = {
        north: event.Wa.j,
        south: event.Wa.i,
        east: event.Sa.j,
        west: event.Sa.i
      }
      let arr = [
        [value.west, value.north],
        [value.east, value.south]
      ]
      this.$set(this.filter.coordinates, index, arr);
    },
    resetRectangles() {
      this.rectangles = [];
      this.filter.coordinates = [];
    },
    addRectangle(event) {
      let value = {
        north: event.lat(),
        south: event.lat(),
        east: event.lng(),
        west: event.lng()
      }
      this.rectangles.unshift(value);

      let arr = [
        [value.west, value.north],
        [value.east, value.south]
      ]
      this.filter.coordinates.unshift(arr);
    },
    deleteRectangle(event, index) {
      this.rectangles.splice(index, 1);
      this.filter.coordinates.splice(index, 1);
    },
    associateEvent() {
      this.notify_me = !this.notify_me;

      if (this.notify_me) {
        this.overlay = true; //Mostra overlay con info bot telegram
        this.$set(this.filter, "event", {countRequired: null})
      } else if (this.filter.event) {
        this.$delete(this.filter, "event")
      }
    },
  },
  mounted() {
    let arr = [];
    arr.push({
      text: "Any language",
      value: null
    })
    for (const lang in language) {
      arr.push({
        text: language[lang],
        value: lang
      })
    }
    this.languageArray = arr;
  }
}
</script>

<style scoped>

</style>