<template>
  <v-container>
    <v-form>
      <v-row>
          <v-col>
            <v-btn color="primary" class="mr-1" @click="onSubmit">Submit</v-btn>
            <v-btn color="secondary">Clear</v-btn>
          </v-col>
          <v-col class="align-end">
            <v-row>
              <v-col>
                <v-checkbox label="Notify me" color="secondary" @click="associateEvent"> </v-checkbox>
              </v-col>
              <v-col>
                <v-text-field v-if="filter.event" :rules="onlyNumbers" v-model.number="filter.event.countRequired" label="Number of required tweet"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
      </v-row>
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
                clearable
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
        </v-col>

        <v-col>

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
          <!--
        <v-card class="mb-5">
          <v-card-title>Filters</v-card-title>

          <v-card-text>
            <v-switch label="Replies" v-model="filter.filters.replies"></v-switch>
            <v-radio-group v-model="filter.filters.repliesValue" v-if="filter.filters.replies">
              <v-radio label="Include replies and original Tweets" value="replies-and-tweets"></v-radio>
              <v-radio label="Only show replies" value="only-replies"></v-radio>
            </v-radio-group>
            <v-switch label="Links" v-model="filter.filters.links"></v-switch>
            <v-text-field
                v-model.trim="filter.filters.linksValue"
                label="Link to filter"
            ></v-text-field>
            <v-radio-group v-model="filter.filters.linksValue" v-if="filter.filters.links">
              <v-radio label="Include Tweets with links" value="include-links"></v-radio>
              <v-radio label="Only show Tweets with links" value="only-links"></v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>
-->
<!--
         <v-card class="mb-5">
            <v-card-title>Engagement</v-card-title>
            <v-card-text>
              <v-text-field
                  v-for="item in labels.engagement"
                  v-model="filter.engagement[item.key]"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
              ></v-text-field>
            </v-card-text>
          </v-card>
-->
          <v-card class="mb-5">
            <v-card-title>Dates</v-card-title>
            <v-card-text>
              <v-menu
                  v-model="fromMenu"
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
                      @click:clear="fromDate = ''"
                  ></v-text-field>
                </template>
                <v-date-picker
                    clearable
                    v-model="filter.dates.from"
                    :max="filter.dates.to"
                    @input="fromMenu = false"
                ></v-date-picker>
              </v-menu>
              <v-menu
                  v-model="toMenu"
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
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model.trim="filter.dates.to"
                    :min="filter.dates.from"
                    @input="toMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import axios from "axios";
import language from "@/assets/language.json"

export default {
  name: 'FilterMenu',
  methods: {
    onSubmit() {
      axios.put('/api/samples/' + this.name, this.filter)
    },

    associateEvent(){
     this.notify_me = !this.notify_me;

     if(this.notify_me){
       this.$set(this.filter,"event", {countRequired: null})
     }
     else if(this.filter.event){
       this.$delete(this.filter,"event")
     }
    }
  },
  data: () => ({
    name: "",
    languageArray: null,
    notify_me: false,
    filter: {
      words: {
        all: [],
        exact: [],
        any: [],
        none: [],
        hashtags: [],
        language: null
      },
      accounts: {
        from: [],
        to: [],
        mentioning: []
      },

     /* filters: {
        //replies: true,
        //repliesValue: "replies-and-tweets",
        links: true,
        linksValue: null
      },*/
      /*
      engagement: {
        minReplies: "",
        minLikes: "",
        minRetweets: ""
      },
      */
      dates: {
        from: null,
        to: null
      }
    },
    toMenu: false,
    fromMenu: false,
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
      /*engagement: {
        minReplies: {
          hint: "Example: 280 · Tweets with at least 280 replies",
          label: "Minimum replies",
          key: "minReplies"
        },
        minLikes: {
          hint: "Example: 280 · Tweets with at least 280 Likes",
          label: "Minimum Likes",
          key: "minLikes"
        },
        minRetweets: {
          hint: "Example: 280 · Tweets with at least 280 Retweets",
          label: "Minimum Retweets",
          key: "minRetweets"
        },
      }*/
    },

    onlyNumbers: [
      value => !!value || 'Required.',
      value => (value <= 12000) || 'At most 12000',
      value => (value >= 1) || 'At least 1',
    ]

  }),
  mounted() {
      let arr = [];
      arr.push({
        text: "Any language",
        value: null
      })
      for( const lang in language ) {
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