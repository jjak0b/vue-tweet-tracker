const SocialContentProvider = require("./SocialContentProvider");
const WordMap = require("../WordMap");

function main() {

    let status1 = "Test1: Hello World !! this is a word cloud posted using twitter API "
    let status2 = "Test2: Hello World !! this is a word cloud posted using twitter API but words count are doubled";

    let socialProvider = new SocialContentProvider();
    let wordMap1 = new WordMap( [ status1 ], null );
    let wordMap2 = new WordMap( [ status2, status2 ], null );
    let promises1 = socialProvider.publishPost(status1, wordMap1 );
    let promises2 = socialProvider.publishPost(status2, wordMap2 );

    promises1
        .then( (data) => {
            console.log("return data 1", data);
        })
        .catch( (e) => {
            console.log("return error 1", e);
        });
    promises2
        .then( (data) => {
            console.log("return data 2", data);
        })
        .catch( (e) => {
            console.log("return error 2", e);
        });
}





main();