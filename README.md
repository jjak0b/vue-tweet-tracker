# tt2020_14

# API Setup
### Twitter API
Note: This tweet tracker use [twitter api v2](https://developer.twitter.com/en/docs/twitter-api/early-access).
this information is needed to [get your own twitter api keys and secrets](https://developer.twitter.com/content/developer-twitter/en/portal/projects-and-apps)
create a file ".env" into root project folder and add the following text:
```
TWITTER_API_CONSUMER_KEY=******
TWITTER_API_CONSUMER_SECRET=******
TWITTER_API_ACCESS_TOKEN=******
TWITTER_API_ACCESS_TOKEN_SECRET=******
TWITTER_API_BEARER_TOKEN=******
PATH_REPOSITORIES_SAMPLES=repositories
```
where "******" are respectively the API keys and secrets from twitter as app project

### Google maps API
create a file ".env.local" into root project folder and add the following text:
```
VUE_APP_EXTERNAL_GOOGLE_MAPS_API_KEY=******
```
Where "******" is the API key as app google map project

[Get your own google maps API key](https://developers.google.com/maps/documentation/directions/get-api-key)

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
