const NotificationService = require("./NotificationService");
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require("path");
const Markup = require('telegraf/markup');
const sampling = require('../../../SamplingFacade');

class TelegramNotificationService extends NotificationService {
    constructor() {
        super()
        this.bot = new Telegraf(process.env.BOT_TOKEN);
        this.filepath = path.join( global.__basedir, "..", "telegram.json" );
        this.bot.start(ctx => {
            this.start(ctx)
        })
        this.bot.help(ctx =>{
            this.help(ctx)
        })
        this.bot.command('add', ctx => {
            this.add(ctx)
        })
        this.bot.command('stop', ctx =>{
            this.stop(ctx)
        })
        this.bot.launch();
    }

    send( /*TelegramContact*/contact, /*TelegramMessage*/ message ){
        this.bot.telegram.sendMessage(contact, message);
    }

    start(ctx){
            ctx.reply('Progetto SWE gruppo 14')

            let json = JSON.parse(fs.readFileSync( this.filepath ) );
            if(Object.keys(json).length != 0){
                for(let i = 0; i < Object.keys(json).length; i++){
                    if(json[i].chatid != ctx.message.chat.id){
                        json.push({chatid: ctx.message.chat.id})
                    }
                }
                json = JSON.stringify(json,null,4)
                fs.writeFileSync(this.filepath, json)
            }
            else{
                json.push({chatid: ctx.message.chat.id})
                json = JSON.stringify(json,null,4)
                fs.writeFileSync(this.filepath, json)
            }

        }

    help(ctx){
            ctx.reply('Contattare Gruppo 14')
    }
    add(ctx){
        let active = sampling.getSamplesStates().get("active")
        let paused = sampling.getSamplesStates().get("paused")
        let tags = active.concat(paused)
        let users = JSON.parse(fs.readFileSync(this.filepath))
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
        this.bot.on('message', ctx =>{
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
                            fs.writeFileSync(this.filepath, JSON.stringify(users, null, 4))
                        }
                        else{
                            arr.push(ctx.message.text)
                            users[i].events = arr
                            fs.writeFileSync(this.filepath, JSON.stringify(users, null, 4))
                        }
                    }
                }
            }

        })
    }

    stop(ctx){
        let json = JSON.parse(fs.readFileSync(this.filepath))
        let id = ctx.message.chat.id
        for(let i = 0; i < json.length; i++){
            if(id === json[i].chatid){
                delete json[i].events
                fs.writeFileSync(this.filepath,JSON.stringify(json,null,4))
            }
        }
    }

}

module.exports = TelegramNotificationService;