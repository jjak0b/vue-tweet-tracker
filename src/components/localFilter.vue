<template>
  <v-form ref="form">
    <v-card class="pa-5">
      <v-row>
        <v-col>
        <v-btn color="primary" class="mr-1" @click="onSubmit">Submit</v-btn>
        <v-btn color="secondary" @click="onReset">Reset</v-btn>
        </v-col>
      </v-row>
    <v-row>
      <v-col>
        <div class="mb-5">
          <h3>Words</h3>
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
        </div>

        <div class="mb-5">
          <h3>Dates</h3>
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
        </div>
      </v-col>

      <v-col>
        <div class="mb-5">
          <h3>Position</h3>
            <position-input
                :rectangles="rectangles"
                @add-rectangle="addRectangle"
                @delete-rectangle="deleteRectangle"
                @update-rectangle="updateRectangle"
                @reset-rectangles="resetRectangles"
            >
            </position-input>
        </div>

        <div class="mb-5">
          <h3>Accounts</h3>
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
        </div>

        <div class="mb-5">
          <h3>Context</h3>
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
        </div>
      </v-col>
    </v-row>
    </v-card>
  </v-form>
</template>

<script>
import language from "@/assets/language.json";
import positionInput from "@/components/charts/positionInput";

export default {
  name: "localFilter",
  props: {
    filter: Object
  },
  components: {
    positionInput
  },
  data() {
    return {
      rectangles: [],
      languageArray: null,
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
      }
    }
  },
  methods: {
    onSubmit() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.$emit('submit', this.filter);
    },
    onReset() {
      //this.$refs.form.resetValidation();
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