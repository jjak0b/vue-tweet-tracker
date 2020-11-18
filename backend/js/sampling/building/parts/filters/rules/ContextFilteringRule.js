const FilteringRule = require("./FilteringRule");

class ContextFilteringRule extends FilteringRule {
    constructor( /*String*/tag, id, /*ContextFilter*/filter ) {
        super(filter);
        this.tag = tag;
        this.id = id;
    }
}

module.exports = ContextFilteringRule;