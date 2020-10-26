const nconf = require('nconf')      //configuration file
const fs = require('fs')            //filesystem
const config = nconf.file('../keys.json')   //file con le key per le twitter api
const needle = require('needle')

//TO-DO
//usare api v2.0

const bearer = config.get('Bearer_token')   //bearer token
const endpointUrl = 'https://api.twitter.com/2/tweets/search/recent'

async function getRequest(){    //funzione per richiedere i dati da twitter
    const params = {            //parametri della richiesta
        'query': '#ingsw2020',
        'tweet.fields': 'author_id,created_at,id,possibly_sensitive,text,geo',
        'place.fields': 'full_name,geo,name,place_type',
        'user.fields': 'name,created_at'
    }
    const res = await needle('get', endpointUrl, params, { headers: { "authorization": `Bearer ${bearer}` }})   //richiesta

    if(res.body){
        return res.body
    }
    else{
        throw new Error ('Richiesta non riuscita')
    }
}

async function saveData(data){  //funzione per salvare i dati ottenuti in un file json
    let jsondata = JSON.stringify(data, null, 4)
    fs.writeFileSync('../tweets.json', jsondata, (err) =>{
        if (err) throw err;
    })
    console.log('file saved')
}

(async () => {

    try {
        // Make request
        const response = await getRequest();
        console.log(response)
        await saveData(response)

    } catch(e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
  })();

