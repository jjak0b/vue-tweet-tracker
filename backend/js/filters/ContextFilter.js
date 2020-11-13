const StandardFilter = require("./StandardFilter");

class ContextFilter extends StandardFilter {
    constructor(rawData) {
        super(rawData);
    }
}

module.exports = ContextFilter;