const Filter = require("../../Filter");

class StandardFilter extends Filter {
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
        this.keywords = Object.assign( this.accounts, rawData.accounts );

    }
}

module.exports = StandardFilter;