const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require("path");
const Markup = require('telegraf/markup');
const sampling = require('./SamplingFacade');

const bot = new Telegraf(process.env.BOT_TOKEN);
let filepath = path.join( global.__basedir, "..", "telegram.json" );

bot.start((ctx) => {
    ctx.reply('Progetto SWE gruppo 14')

    let json = JSON.parse(fs.readFileSync( filepath ) );
    if(Object.keys(json).length != 0){
        for(let i = 0; i < Object.keys(json).length; i++){
            if(json[i].chatid != ctx.message.chat.id){
                json.push({chatid: ctx.message.chat.id})
            }
        }
        json = JSON.stringify(json,null,4)
        fs.writeFileSync(filepath, json)
    }
    else{
        json.push({chatid: ctx.message.chat.id})
        json = JSON.stringify(json,null,4)
        fs.writeFileSync(filepath, json)
    }

});

bot.help(ctx => {
    ctx.reply('Contattare Gruppo 14')
});

bot.command('add', ctx => {

    let tags = sampling.getInstance().request(null);
    let users = JSON.parse(fs.readFileSync(filepath))
    let followed = []
    for(let i = 0; i < users.length; i++){
        if(users[i].chatid == ctx.message.chat.id){
            if(users[i].hasOwnProperty('events')){
                for(let j = 0; j < users[i].events.length; j++)
                    followed.push(users[i].events[j])
            }
        }
    }

    tags = tags.filter(val => !followed.includes(val))
    ctx.reply('Events',Markup
        .keyboard(tags)
        .oneTime()
        .resize()
        .extra()
    )
    bot.on('message', ctx =>{
        let arr = []
        if(tags.includes(ctx.message.text)){
            for(let i = 0; i < users.length; i++){
                if(users[i].chatid == ctx.message.chat.id){
                    if(users[i].hasOwnProperty('events')){
                        for(let j = 0; j < users[i].events.length; j++){
                            arr.push(users[i].events[j])
                        }
                        arr.push(ctx.message.text)
                        users[i].events = arr
                        fs.writeFileSync(filepath, JSON.stringify(users, null, 4))
                    }
                    else{
                        arr.push(ctx.message.text)
                        users[i].events = arr
                        fs.writeFileSync(filepath, JSON.stringify(users, null, 4))
                    }
                }
            }
        }

    })
})

bot.command('stop', ctx =>{

    let json = JSON.parse(fs.readFileSync(filepath))
    let id = ctx.message.chat.id
    for(let i = 0; i < json.length; i++){
        if(id === json[i].chatid){
            delete json[i].events
            fs.writeFileSync(filepath,JSON.stringify(json,null,4))
        }
    }
});

function alertEvent(tag, message){
    let contacts = checkContacts(tag)
    let text = tag + "\n" + message
    for(let i = 0; i < contacts.length; i ++){
        bot.telegram.sendMessage(contacts[i], text);
    }
}

function checkContacts(tag){
    let contacts = []
    let users = JSON.parse(fs.readFileSync(filepath))
    for(let i = 0; i < users[i].length; i++){
        for(let j = 0; i < users[i].events.length; j++){
            if(users[i].events[j] == tag)
                contacts.push(users[i].chatid)
        }
    }
    return contacts
}

bot.launch();

module.exports = bot;
module.exports.alertEvent = alertEvent