# Tweet Tracker (Unmaintained, [reason](https://twitter.com/TwitterDev/status/1621026986784337922))
[![Twitter API v1.1](https://img.shields.io/endpoint?url=https%3A%2F%2Ftwbadges.glitch.me%2Fbadges%2Fstandard)](https://developer.twitter.com/en/docs/twitter-api/v1)
[![Twitter API v2](https://img.shields.io/endpoint?url=https%3A%2F%2Ftwbadges.glitch.me%2Fbadges%2Fv2)](https://developer.twitter.com/en/docs/twitter-api/early-access)

The app includes a back-end express app with REST APIs and a front-end client app.
The backend app allows you to create samples and sampling realtime tweets that match with some options of a filter form, pause and resume samples using REST APIs.  
The frontend app allows you to graphically check Analytics on the sampled tweets through charts and visualize geo-tagged tweets in a map. It allows you to pause and resume the samples you need in any time using the backend REST API.  
The App uses also a Telegram Bot to allows any user to subscribe at any sample and receive an event notification when the sampled items count reach an arbitrary number set by the author of the sample. Chatting with the bot allow you to check sample status and current count of sampled tweets and allows you to unsubsribe from events of a sample. All of this using the Telegram App installed in your device.  
The backend app allows you to post periodically a word-cloud of most used words in sampled tweets of a sample using a twitter service account. 
The event notification condition and the setup of periodic posting is set by the frontend app through the backend REST API when a new sample has been added.  

# App Setup and API

## Backend
create a file `.env` into root project folder and add the following text:
```
PORT=3000
```
Where the value 3000 is assigned to the key "PORT" to use a custom port for the backend server

### Twitter API
Note: This tweet tracker use [twitter api v2](https://developer.twitter.com/en/docs/twitter-api/early-access).
this information is required to [get your own twitter api keys and secrets](https://developer.twitter.com/content/developer-twitter/en/portal/projects-and-apps).
In App settings set as App permissions: `Read and Write - Read and Post Tweets and profile information`
Note: Write permission is required to post periodically a word-cloud of a specific sample and for testing scripts.
After that add the following text to your `.env` file:
```
TWITTER_API_CONSUMER_KEY=******
TWITTER_API_CONSUMER_SECRET=******
TWITTER_API_ACCESS_TOKEN=******
TWITTER_API_ACCESS_TOKEN_SECRET=******
TWITTER_API_BEARER_TOKEN=******
PATH_REPOSITORIES_SAMPLES=repositories
```
where "******" are respectively the API keys and secrets from twitter as app project

### Telegram BOT
The app can notify some subscribed users by getting notification from telegram bot directly to user's chat
To use the [Telegram Bot API](https://core.telegram.org/bots/api), you first have to [get a bot account](https://core.telegram.org/bots) by [chatting with BotFather](https://core.telegram.org/bots#6-botfather).
After that add to `.env` file your bot token, it should be something like the following example:
```
BOT_TOKEN=123456789:AbCdfGhIJKlmNoQQRsTUVwxyZ
```

## Frontend
create a file `.env.local` into root project folder and add the following text:
```
PORT=80
```
Where the value 80 is assigned to the key "PORT" to use a custom port for the frontend server

### Google maps API
To use the Maps provided by google maps apis you need to [get your own google maps API key](https://developers.google.com/maps/documentation/directions/get-api-key)
After that add to `.env.local` file your google maps api key, like the following example:
```
VUE_APP_EXTERNAL_GOOGLE_MAPS_API_KEY=******
```
Where "******" is the API key as app google map project

## Project setup
```
npm install
```

### Run frontend web server ( server process to serve UI to create and handle samples )
```
npm run serve
```

### Run backend api server ( server process to serve and sampling at realtime )
```
npm run api
```

### Customize configuration
If needed, see [Configuration Reference](https://cli.vuejs.org/config/).
