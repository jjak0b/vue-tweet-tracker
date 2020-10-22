const Twitter = require('twitter')  //twitter api
const nconf = require('nconf')      //configuration file
const fs = require('fs')            //filesystem
const mail = require('nodemailer')  //mail

const config = nconf.file('../keys.json')   //file con le key per le twitter api

const client = new Twitter({    //configurazione client di twitter
    access_token_key: config.get("Api_key"),
    access_token_secret: config.get("Api_Secret_key"),
    bearer_token: config.get("Bearer_token")
});

const transporter = mail.createTransport({
    service: 'gmail',
    auth: {
        user: 'twittertracker202014@gmail.com',
        pass: 'tt202014'
    }
})

var mailOptions = {
    from: 'twittertracker202014@gmail.com',
    to: 'lucabennati2k16@gmail.com',
    subject: 'test mail node js',
    text: 'speriamo vada'
}

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
       
/*
client.get('search/tweets', {q: "from:LucaBennati2" }, (error,tweets,res) =>{
    console.log(tweets)
    let data = JSON.stringify(tweets);
    //salvo i dati su file
    fs.writeFile('../tweets.json', data, (err) =>{
        if (err) throw err;
    })
}) */