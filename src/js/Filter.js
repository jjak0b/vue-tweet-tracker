export default class Filter {

    constructor() {
        this.coordinates = [];
        this.words = {
            all: [],
            exact: [],
            any: [],
            none: [],
            hashtags: [],
            language: null
        };
        this.accounts = {
            from: [],
            to: [],
            mentioning: []
        };

        this.context = {
            entities: []
        };
        this.dates = {
            from: null,
            to: null
        }
    }
}
