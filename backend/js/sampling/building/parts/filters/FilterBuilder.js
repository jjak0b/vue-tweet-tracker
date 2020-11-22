const StandardFilter = require("./StandardFilter");
const GeocodedFilter = require("./GeocodedFilter");
const ContextFilter = require("./ContextFilter");

class FilterBuilder {

    /**
     *
     * @param rawFilter
     * @returns {GeocodedFilter|ContextFilter|StandardFilter|null}
     */
    static build( rawFilter ) {
        let filter = null;
        switch ( rawFilter.type ) {
            case "geo":
                filter = new GeocodedFilter( rawFilter );
                break;
            case "context":
                filter = new ContextFilter( rawFilter );
                break;
            default:
                break;
        }
        return filter;
    }
}

module.exports = FilterBuilder;