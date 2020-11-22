const StandardFilter = require("./StandardFilter");

class GeocodedFilter extends StandardFilter {
    constructor(rawData) {
        super("geo", rawData);

        this.locations = [];

        this.locations = this.locations.concat( rawData.coordinates );
    }
}

module.exports = GeocodedFilter;