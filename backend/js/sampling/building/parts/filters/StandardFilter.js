const SamplingFilter = require("../SamplingFilter");

class StandardFilter extends SamplingFilter {
    constructor(type, rawData) {
        super(type);

        this.keywords = {
            any : [],
            all : [],
            exact: [],
            hashtags: []
        };

        this.accounts = {
            authors: [],
            mentioned: [],
            replied: []
        };

        if( rawData.words ) {
            this.keywords = Object.assign(this.keywords, rawData.words);
        }

        if( rawData.accounts ) {
            this.accounts.authors = Object.assign(this.accounts.authors, rawData.accounts.from);
            this.accounts.mentioned = Object.assign(this.accounts.mentioned, rawData.accounts.mentioning);
            this.accounts.replied = Object.assign(this.accounts.replied, rawData.accounts.to);
        }

    }
}

module.exports = StandardFilter;