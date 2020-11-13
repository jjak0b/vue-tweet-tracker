const StandardFilter = require("./StandardFilter");

class GeocodedFilter extends StandardFilter {
    constructor(rawData) {
        super(rawData);
    }
}

module.exports = GeocodedFilter;