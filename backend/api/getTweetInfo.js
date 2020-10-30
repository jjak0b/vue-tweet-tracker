const fs = require('fs')
let tweetarray =[]
function parseData(tweets){
    let tweet

    let users = tweets.includes.users
    let data = tweets.data
        if(tweets.includes.hasOwnProperty('place')){
            let place = tweets.includes.place

            tweet ={
                tweet:{
                    data,
                    place,
                    users
                }

            }
        }
        else{
            tweet = {
                tweet:{
                    data,
                    users
                }
            }
    }
    tweetarray.push(tweet)
    //console.log(tweetarray)
    saveData(JSON.stringify(tweetarray, null, 4))

}

function saveData(tweet){
    fs.writeFileSync('./tweets.json', tweet)
}

module.exports.parsedata = parseData