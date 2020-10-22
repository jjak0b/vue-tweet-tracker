<template>
  <v-container>
    <v-form>
      <v-row>
        <v-col>
          <v-container>
            <v-btn color="primary" class="mr-1">Submit</v-btn>
            <v-btn color="secondary">Clear</v-btn>
          </v-container>
          <v-card class="mb-5">
            <v-card-title>Words</v-card-title>
            <v-card-text>
              <v-text-field
                  v-for="item in words"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
              ></v-text-field>
              <v-select
                  :items="language"
                  hint="Language"
                  persistent-hint
              ></v-select>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>Accounts</v-card-title>
            <v-card-text>
              <v-text-field
                  v-for="item in accounts"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col>
          <v-card class="mb-5">
            <v-card-title>Filters</v-card-title>
            <v-card-text>
              <v-switch label="Replies" v-model="repliesSwitch"></v-switch>
              <v-radio-group v-model="repliesRadio" v-if="repliesSwitch">
                <v-radio label="Include replies and original Tweets" value="replies-and-tweets"></v-radio>
                <v-radio label="Only show replies" value="only-replies"></v-radio>
              </v-radio-group>
              <v-switch label="Links" v-model="linksSwitch"></v-switch>
              <v-radio-group v-model="linksRadio" v-if="linksSwitch">
                <v-radio label="Include Tweets with links" value="include-links"></v-radio>
                <v-radio label="Only show Tweets with links" value="only-links"></v-radio>
              </v-radio-group>
            </v-card-text>
          </v-card>

          <v-card class="mb-5">
            <v-card-title>Engagement</v-card-title>
            <v-card-text>
              <v-text-field
                  v-for="item in engagement"
                  :key="item.label"
                  :hint="item.hint"
                  :label="item.label"
                  clearable
              ></v-text-field>
            </v-card-text>
          </v-card>

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
                      :value="fromDate"
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
                    v-model="fromDate"
                    :max="toDate"
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
                      v-model="toDate"
                      label="To"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      clearable
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="toDate"
                    :min="fromDate"
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
export default {
  name: 'FilterMenu',

  data: () => ({
    toMenu: false,
    toDate: "",
    fromMenu: false,
    fromDate: "",
    repliesSwitch: true,
    linksSwitch: true,
    repliesRadio: "replies-and-tweets",
    linksRadio: "include-links",
    words: {
      all: {
        hint: 'Example: what’s happening · contains both “what’s” and “happening”',
        label: "All of these words"
      },
      exact: {
        hint: 'Example: happy hour · contains the exact phrase “happy hour”',
        label: "This exact phrase"
      },
      any: {
        hint: 'Example: cats dogs · contains either “cats” or “dogs” (or both)',
        label: "Any of these words"
      },
      none: {
        hint: 'Example: cats dogs · does not contain “cats” and does not contain “dogs”',
        label: "None of these words"
      },
      hashtag: {
        hint: 'Example: #ThrowbackThursday · contains the hashtag #ThrowbackThursday',
        label: "These hashtags"
      }
    },
    accounts: {
      from: {
        hint: "Example: @Twitter · sent from @Twitter",
        label: "From these accounts"
      },
      to: {
        hint: "Example: @Twitter · sent in reply to @Twitter",
        label: "To these accounts"
      },
      mention: {
        hint: "Example: @SFBART @Caltrain · mentions @SFBART or mentions @Caltrain",
        label: "Mentioning these accounts"
      },
    },
    engagement: {
      replies: {
        hint: "Example: 280 · Tweets with at least 280 replies",
        label: "Minimum replies"
      },
      likes: {
        hint: "Example: 280 · Tweets with at least 280 Likes",
        label: "Minimum Likes"
      },
      retweets: {
        hint: "Example: 280 · Tweets with at least 280 Retweets",
        label: "Minimum Retweets"
      },
    },
    language: [
      "Any language",
      "Arabic",
      "Bangla",
      "Basque",
      "Bulgarian",
      "Catalan",
      "Croatian",
      "Czech",
      "Danish",
      "Dutch",
      "English",
      "Finnish",
      "French",
      "German",
      "Greek",
      "Gujarati",
      "Hebrew",
      "Hindi",
      "Hungarian",
      "Indonesian",
      "Italian",
      "Japanese",
      "Kannada",
      "Korean",
      "Marathi",
      "Norwegian",
      "Persian",
      "Polish",
      "Portuguese",
      "Romanian",
      "Russian",
      "Serbian",
      "Simplified Chinese",
      "Slovak",
      "Spanish",
      "Swedish",
      "Tamil",
      "Thai",
      "Traditional Chinese",
      "Turkish",
      "Ukrainian",
      "Urdu",
      "Vietnamese"
    ]
  })
}
</script>

<style scoped>

</style>