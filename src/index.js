const Twitter = require('twitter')  //twitter api
const nconf = require('nconf')      //configuration file
const fs = require('fs')            //filesystem

const config = nconf.file('../keys.json')   //file con le key per le twitter api

const client = new Twitter({    //configurazione client di twitter
    access_token_key: config.get("Api_key"),
    access_token_secret: config.get("Api_Secret_key"),
    bearer_token: config.get("Bearer_token")
});

//in q metto i parametri di ricerca, tweet_mode: 'extended' serve per visualizzare l'intero tweet nel campo text
client.get('search/tweets', {q: '#ingsw2020', tweet_mode: 'extended'}, (error,tweets,res) =>{
    //console.log(tweets)
    let data = JSON.stringify(tweets, ""," ");
    
    //salvo i dati su file
    fs.writeFile('../tweets.json', data, (err) =>{
        if (err) throw err;
    })
})