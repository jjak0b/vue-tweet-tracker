class TelegramBotInfo {

    constructor (){
        let username = "tt202014_bot"
        this._tag = "@" + username
        this._link = "https://t.me/" + username
    }
    get tag(){
        return this._tag
    }
    get link(){
        return this._link
    }
}

module.exports = TelegramBotInfo