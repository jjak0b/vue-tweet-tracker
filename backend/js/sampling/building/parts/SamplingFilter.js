class SamplingFilter {
    constructor(/*String*/type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
}

module.exports = SamplingFilter;