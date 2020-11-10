require('dotenv')
const { Telegraf } = require('telegraf');
const fs = require('fs')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Progetto SWE gruppo 14')

    let user ={
        ids:[{
            chatid: ctx.message.chat.id
        }]
    }
    let json = JSON.parse(fs.readFileSync('../../telegram.json'))
    if(Object.keys(json).length != 0){
        json['ids'].push({chatid:ctx.message.chat.id})
        console.log(json)
        user = JSON.stringify(json,null,4)
        fs.writeFileSync('../../telegram.json', user)
    }
    else{
        user = JSON.stringify(user,null,4)
        fs.writeFileSync('../../telegram.json', user)
    }

});

bot.help(ctx => {
    ctx.reply('Contattare Gruppo 14')
});



bot.command('stop', ctx =>{
    let json = JSON.parse(fs.readFileSync('../../telegram.json'))
    console.log(json)
    let id = ctx.message.chat.id
    for(let i = 0; i < json.ids.length; i++){
        if(id === json.ids[i].chatid){
            json.ids.splice(i,1)
            fs.writeFileSync('../../telegram.json',JSON.stringify(json,null,4))
        }
    }
});

bot.on('message', (ctx)=>{
    let json = JSON.parse(fs.readFileSync('../../telegram.json'))
    for(let i = 0; i < json.ids.length;i++){
        bot.telegram.sendMessage(json.ids[i].chatid, 'prova send msg')
    }

});

bot.launch();