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

        this.keywords = Object.assign( this.keywords, rawData.keywords );
        this.accounts = Object.assign( this.accounts, rawData.accounts );

    }
}

module.exports = StandardFilter;