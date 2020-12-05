const NotificationService = require("./NotificationService");
const { Telegraf, Markup } = require('telegraf');
const path = require("path");
const TelegramMessage = require("../messages/TelegramMessage");
const ItemsCollection = require("../../../ItemsCollection");
const FSResourceStorage = require("../../../FSResourceStorage");
const TelegramContact = require("../contacts/TelegramContact");
const sampling = require('../../../SamplingFacade').getInstance();

class TelegramNotificationService extends NotificationService {
    constructor() {
        super()
        this.bot = new Telegraf(process.env.BOT_TOKEN);
        this.filepath = path.join( global.__basedir, "..", "telegram.json" );

        this.contacts = new ItemsCollection( "telegram.json", [], 128 );
        this.contacts.setStorage( FSResourceStorage.getInstance() );

        this.registerHandlers();

        this.contacts.fetch()
            .catch( () => {

            })
            .then( () => {
                let items = this.contacts.getItems();
                for (let i = 0; i < items.length; i++) {
                    Object.setPrototypeOf( items[ i ], TelegramContact);
                }
            })
            .finally( async () => {
                await this.bot.launch();
                console.log(`[${this.constructor.name}]`, "telegram bot service started");
            })
    }

    /**
     *
     * @param contact {TelegramContact}
     * @param message {Message}
     */
    send( contact, message ){
        let tgMessage = new TelegramMessage( message );
        this.bot.telegram.sendMessage(contact.chatid, tgMessage.toString());
    }

    getContacts(tag) {
        let contacts = this.contacts
                        .getItems()
                        .filter( (user) => user.events.includes( tag ) );
        console.log(`[${this.constructor.name}]`, `contacts found registered to event tag "${tag}" :`, contacts );
        return contacts;
    }

    getContactByID(id ) {
        for (const user of this.contacts.getItems()) {
            if( user.chatid === id ) {
                return user;
            }
        }
        return null;
    }


    async registerUser( id, username ){
        let users = this.contacts.getItems();

        if( !users.some( (user) => user.chatid === id ) ) {
            console.log(`[${this.constructor.name}]`, `Registering new contact "${username}" with chat id`, id );
            await this.contacts.add(
                new TelegramContact({
                    chatid: id,
                    events: []
                })
            );
            return true;
        }
        else {
            console.log(`[${this.constructor.name}]`, `already registered an user "${username}" with chat id`, id );
            return false;
        }
    }

    /**
     *
     * @param id
     * @return {String[]}
     */
    getSubscribedTagsForContact(id ) {
        let user = this.getContactByID( id );
        if( user ) {
            return user.events || [];
        }
        return [];
    }

    /**
     *
     * @param id
     * @return {String[]}
     */
    getUnsubscribedTagsForContact(id ) {

        let active = sampling.getSamplesStates().get("active");
        let paused = sampling.getSamplesStates().get("paused");
        /**
         * @type {String[]}
         */
        let tags = active.concat(paused);

        let followed = this.getSubscribedTagsForContact( id )
        return tags.filter(val => !followed.includes(val) );
    }

    registerHandlers() {
        this.bot.start( (ctx) => {
            let markupOption = Markup.keyboard(
                [
                        [
                            "Show my events",
                            "Show available events"
                        ]
                    ]
            )
                .resize()
                .extra();

            let name = ctx.message.chat.first_name || ctx.message.chat.username;
            this.registerUser( ctx.message.chat.id, ctx.message.chat.username )
                .then( async (isNewUser)=> {
                    if( isNewUser ) {
                        await ctx.reply(`Welcome ${ name }`, markupOption );
                    }
                    else {
                        await ctx.reply(`Welcome back ${ name }`, markupOption );
                    }
                });
        });

        this.bot.hears( /my events/i,(ctx) => {
            let tags = this.getSubscribedTagsForContact( ctx.chat.id );
            let tableButtons = tags.map( (tag) =>
                [
                    Markup.callbackButton(tag, `info ${tag}`),
                    Markup.callbackButton("❌", `unsubscribe ${tag}`)
                ]
            );

            if( tableButtons.length > 0 ) {
                ctx.reply("These are your events subscriptions, Select one option to show sample's info or to unsubscribe", Markup
                    .inlineKeyboard(tableButtons, null)
                    .extra()
                )
            }
            else {
                ctx.reply("You are not subscribed to any event" );
            }
        })

        this.bot.hears( /events/i,(ctx) => {

            let tags = this.getUnsubscribedTagsForContact( ctx.chat.id );
            let buttons = tags.map( (tag) =>
                Markup.callbackButton(tag, `subscribe ${tag}`)
            );

            if( buttons.length > 0 ) {
                ctx.reply('These are available events for subscription, select one of them to subscribe on it', Markup
                    .inlineKeyboard(buttons, null)
                    .extra()
                )
            }
            else {
                ctx.reply('No events available' );
            }
        })

        this.bot.action(/^subscribe ([\s\S]+)/, async (ctx) => {
            let tag = ctx.match[1];
            await this.registerUser( ctx.chat.id, ctx.chat.first_name );
            let user = this.getContactByID( ctx.chat.id );

            if( this.getSubscribedTagsForContact( ctx.chat.id ).includes( tag ) ) {
                console.log(`[${this.constructor.name}]`, `event tag "${tag}" already registered for user`, ctx.chat.id );
                ctx.editMessageText( `You are already subscribed at event "${tag}"` );
            }
            else if( this.getUnsubscribedTagsForContact( ctx.chat.id ).includes( tag ) ) {
                console.log(`[${this.constructor.name}]`, `registering event tag "${tag}" to user`, ctx.chat.id );
                user.events.push( tag );
                ctx.editMessageText( `You subscribed at event "${tag}"` )
            }
            else {
                console.warn(`[${this.constructor.name}]`, `event tag "${tag}" unavailable for user`, ctx.chat.id );
                ctx.editMessageText( `The event "${tag}" is unavailable` )
            }
        });

        this.bot.action(/^unsubscribe ([\s\S]+)/, async (ctx) => {
            let tag = ctx.match[1];
            await this.registerUser( ctx.chat.id, ctx.chat.first_name );
            let user = this.getContactByID( ctx.chat.id );

            if( this.getSubscribedTagsForContact( ctx.chat.id ).includes( tag ) ) {
                console.log(`[${this.constructor.name}]`, `removing event tag "${tag}" for user`, ctx.chat.id );
                user.events.splice( user.events.indexOf( tag ) );
                ctx.editMessageText( `You are now unsubscribed from event "${tag}"` );
            }
            else {
                console.warn(`[${this.constructor.name}]`, `event tag "${tag}" unavailable for user`, ctx.chat.id );
                ctx.editMessageText( `You are not subscribed to any event with name "${tag}"` );
            }
        });

        this.bot.action(/info ([\s\S]+)/, (ctx) => {
            let tag = ctx.match[1];

            /**
             * @type {Sample}
             */
            let sample = sampling.getSample(tag);

            if( !sample ) {
                ctx.reply(`The sample "${tag}" doesn't exist`)
                return;
            }


            let isActive = sampling.getSamplesStates().get("active").includes( tag );

            let statusCount = sample.getDescriptor().count;
            let statusLabel = isActive ? "Active" : "Paused";
            let statusEmoji = isActive ? "✅" : "⏸";

            ctx.replyWithMarkdown(
                `*${tag}*\n`
                + `==================\n`
                +`* Status:${statusEmoji} ${statusLabel}\n`
                +`* Sampled items: ***${statusCount}***\n`
            )
        });

        this.bot.catch((err) => {
            console.error(`[${this.constructor.name}]`, "Catched error", err );
        })
    }

}

module.exports = TelegramNotificationService;