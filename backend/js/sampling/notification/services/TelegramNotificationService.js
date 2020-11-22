const NotificationService = require("./NotificationService");
const { Telegraf } = require('telegraf');
const path = require("path");
const Markup = require('telegraf/markup');
const TelegramMessage = require("../messages/TelegramMessage");
const ItemsCollection = require("../../../ItemsCollection");
const FSResourceStorage = require("../../../FSResourceStorage");
const sampling = require('../../../SamplingFacade').getInstance();

class TelegramNotificationService extends NotificationService {
    constructor() {
        super()
        this.bot = new Telegraf(process.env.BOT_TOKEN);
        this.filepath = path.join( global.__basedir, "..", "telegram.json" );
        this.bot.start(this.start.bind( this) );
        this.bot.help(this.help.bind( this));
        this.bot.command('add', this.add.bind( this) );
        // this.bot.command('remove', this.remove.bind( this) ); // needs review because add and remove post message conflicts
        this.bot.command('stop', this.stop.bind( this) );

        this.contacts = new ItemsCollection( "telegram.json", [], 128 );
        this.contacts.setStorage( FSResourceStorage.getInstance() );

        this.contacts.fetch()
            .catch( () => {

            })
            .finally( async () => {
                await this.bot.launch();
                console.log(`[${this.constructor.name}]`, "telegram bot service started");
            })
    }

    send( /*TelegramContact*/contact, /*TelegramMessage*/ message ){
        let tgMessage = new TelegramMessage( message );
        this.bot.telegram.sendMessage(contact, tgMessage.toString());
    }

    getContacts(tag) {
        let contacts =[]
        let users = this.contacts.getItems();
        for(let i = 0; i < users.length; i++){
            if(users[i].hasOwnProperty('events')){
                for(let j = 0; j < users[i].events.length; j++){
                    if(users[i].events[j] === tag){
                        contacts.push(users[i].chatid)
                    }
                }
            }
        }
        console.log(`[${this.constructor.name}]`, `contacts found registered to event tag "${tag}" :`, contacts );
        return contacts
    }

    async start(ctx){
            ctx.reply('Progetto SWE gruppo 14');
            let users = this.contacts.getItems();
            if( !users.some( (user) => user.chatid === ctx.message.chat.id ) ) {
                console.log(`[${this.constructor.name}]`, "registering new contact id", ctx.message.chat.id );
                await this.contacts.add( {chatid: ctx.message.chat.id} );
            }
            else {
                console.log(`[${this.constructor.name}]`, "already registered an user chat with id", ctx.message.chat.id );
            }
    }

    help(ctx){
            ctx.reply('Contattare Gruppo 14')
    }
    async add(ctx){
        console.log(`[${this.constructor.name}]`, "user", ctx.message.chat.id, "want to know the available tags" );
        let active = sampling.getSamplesStates().get("active")
        let paused = sampling.getSamplesStates().get("paused")
        let tags = active.concat(paused)
        let users = this.contacts.getItems();
        let followed = []

        for(let i = 0; i < users.length; i++){
            if(users[i].chatid === ctx.message.chat.id){
                if(users[i].hasOwnProperty('events')){
                    for(let j = 0; j < users[i].events.length; j++)
                        followed.push(users[i].events[j])
                }
            }
        }

        tags = tags.filter(val => !followed.includes(val));
        console.log(`[${this.constructor.name}]`, "available tags for user", ctx.message.chat.id, "are", tags );
        console.log(`[${this.constructor.name}]`, "waiting user response for", ctx.message.chat.id);
        try {
            await ctx.reply('Choose an event to subscribe', Markup
                .keyboard(tags)
                .oneTime()
                .resize()
                .extra()
            );
            this.bot.on('message', ctx => {
                if (tags.includes(ctx.message.text)) {
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].chatid === ctx.message.chat.id) {
                            if (!users[i].hasOwnProperty('events')) {
                                users[i].events = [];
                            }
                            console.log(`[${this.constructor.name}]`, `registering event tag "${ctx.message.text}" to user`, ctx.message.chat.id );
                            users[i].events.push(ctx.message.text);
                        }
                    }
                }
            });
        }
        catch (e) {
            console.error(`[${this.constructor.name}]`, "failed send events list to", ctx.message.chat.id, "cause:\n", e );
        }
    }

    async remove(ctx){
        console.log(`[${this.constructor.name}]`, "user", ctx.message.chat.id, "want to unregister 1 tag" );

        if( !this.contacts.getItems().some( (usr) => usr.chatid === ctx.message.chat.id) ) {
            return;
        }

        let user = this.contacts.getItems().filter( (usr) => usr.chatid === ctx.message.chat.id )[ 0 ];
        let tags = user.events;
        console.log(`[${this.constructor.name}]`, "available subscribed tags for user", user.chatid, "are", tags );
        console.log(`[${this.constructor.name}]`, "waiting user response for", user.chatid );
        try {
            await ctx.reply('Choose an event to unsubscribe', Markup
                .keyboard(tags)
                .oneTime()
                .resize()
                .extra()
            );
            this.bot.on('message', ctx => {
                if ( tags.includes(ctx.message.text) ) {
                    if (user.chatid === ctx.message.chat.id) {
                        if (!user.hasOwnProperty('events')) {
                            user.events = [];
                        }
                        console.log(`[${this.constructor.name}]`, `unregistering event tag "${ctx.message.text}" for user`, ctx.message.chat.id );
                        user.events.splice( user.events.indexOf( ctx.message.text ), 1 );
                    }
                }
            });
        }
        catch (e) {
            console.error(`[${this.constructor.name}]`, "failed send private events list to", ctx.message.chat.id, "cause:\n", e );
        }
    }

    stop(ctx){
        let users = this.contacts.getItems();

        let id = ctx.message.chat.id
        for(let i = 0; i < users.length; i++){
            if(id === users[i].chatid){
                console.log(`[${this.constructor.name}]`, `unregistering events ${users[i].events} for user`, ctx.message.chat.id );
                delete users[i].events;
            }
        }
    }

}

module.exports = TelegramNotificationService;