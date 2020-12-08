const StandardFilter = require("./StandardFilter");

class ContextFilter extends StandardFilter {
    constructor(rawData) {
        super("context", rawData);

        this.keywords.none = [];

        this.context = {
            entities: [],
            language: null,
        };

        this.dates = {
            since: null,
            until: null
        };

        this.locations = [];

        if( rawData.words ) {
            this.context.language = rawData.words.language;
            this.keywords.none = this.keywords.none.concat( rawData.words.none || [] );
        }
        this.locations = Object.assign(this.locations, rawData.coordinates || [] );
        this.context = Object.assign( this.context, rawData.context );
        this.dates = Object.assign(this.dates, rawData.dates );
    }
}

module.exports = ContextFilter;