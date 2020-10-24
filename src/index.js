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
    let data = JSON.stringify(tweets, null,2);  //in data sono presenti i tweet in formato json
    let json = JSON.parse(data) //trasformo il formato json in un oggetto
    let array = []      //array che contiene le informazioni utili di un tweet
    let jsonfromarray   //array in json
    for(let i = 0; i < json.statuses.length; i++){  //scorro il file json
        if(json.statuses[i].place != null){         //se è presente la geolocalizzazione la includo, altrimenti no
            array.push(json.statuses[i].created_at, json.statuses[i].full_text,  json.statuses[i].user.name, json.statuses[i].place.full_name, json.statuses[i].place.country)
        }
        else {
            array.push(json.statuses[i].created_at, json.statuses[i].full_text, json.statuses[i].user.name)
        }
        jsonfromarray = JSON.stringify(array, null, 2)  //trasformo l'array con i tweet in formato json
    }

    console.log(jsonfromarray)

    //salvo i dati su file
    /*fs.writeFile('../tweets.json', data, (err) =>{
        if (err) throw err;
    })
    fs.readFile('../tweets.json', (err, data) => {
        let json = JSON.parse(data)
        for(let i = 0; json.statuses.length; i++){
            console.log(json.statuses[i].created_at)
        }
        })*/
    })

//TO-DO
//inserire i dati raccolti su database