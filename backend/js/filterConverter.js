function convertFilter(filter){

    let query = "";
    if( filter ) {
        if( filter.words ) {
            if( filter.words.all ) {
                query += ` ${ filter.words.all.join( " " )}`;
            }
            if( filter.words.exact ) {
                query += ` "${filter.words.exact.join( " " )}"`;
            }
            if( filter.words.any ) {
                query += ` ${ filter.words.any.join( " OR " )}`;
            }
            if( filter.words.none ) {
                query += ` -${filter.words.none.join( " -" )}`;
            }

            if( filter.words.hashtags ) {
                filter.words.hashtags.forEach( (item, key, array) => array[ key ] = item.replace(/#/g, "") )
                query += ` #${filter.words.hashtags.join( " #" )}`;
            }

            if( filter.words.language ) {
                query += ` lang:${ convertLang(filter.words.language) }`;
            }
        }

        if( filter.accounts ) {
            if( filter.accounts.from ) {
                filter.accounts.from.forEach( (item, key, array) => array[ key ] = item.replace(/@/g, "") )
                query += ` from:${filter.accounts.from.join( " from:")}`;
            }
            if( filter.accounts.to ) {
                filter.accounts.to.forEach( (item, key, array) => array[ key ] = item.replace(/@/g, "") )
                query += ` to:${filter.accounts.to.join( " to:")}`;
            }
            if( filter.accounts.mentioning ) {
                filter.accounts.mentioning.forEach( (item, key, array) => array[ key ] = item.replace(/@/g, "") )
                query += ` @${filter.accounts.mentioning.join( " @")}`;
            }
        }

        if( filter.dates ) {
            if( filter.dates.from || filter.dates.since ) {
                query += ` since:${ filter.dates.from || filter.dates.since }`;
            }
            if( filter.dates.to || filter.dates.until ) {
                query += ` until:${ filter.dates.to || filter.dates.until }`;
            }
        }

        if( filter.filters ) {
            if( filter.filters.links ) {
                query += ` filter:links`;
            }
            if( filter.filters.linksValue ) {
                query += ` url:${filter.filters.linksValue}`;
            }
            if( filter.filters.replies ) {
                query += ` filter:links`;
            }
        }
        if( filter.engagement) {
            if( filter.engagement ) {
                query += ` filter:links`;
            }
        }

        query = query.trim();
    }
    return query;
}

function convertLang(lang){

    if (lang == "Arabic")
        return "ar"
    else if (lang == "Bulgarian")
        return "bg"
    else if (lang == "Czech")
        return "cs"
    else if (lang == "Danish")
        return "da"
    else if (lang == "Dutch")
        return "nl"
    else if (lang == "English")
        return "en"
    else if (lang == "Finnish")
        return "fi"
    else if (lang == "French")
        return "fr"
    else if (lang == "German")
        return "de"
    else if (lang == "Greek")
        return "el"
    else if (lang == "Gujarati")
        return "gu"
    else if (lang == "Hebrew")
        return "iw"
    else if (lang == "Hindi")
        return "hi"
    else if (lang == "Hungarian")
        return "hu"
    else if ( lang == "Indonesian")
        return "in"
    else if ( lang == "Italian")
        return "it"
    else if ( lang == "Japanese")
        return "ja"
    else if ( lang == "Kannada")
        return "kn"
    else if ( lang == "Korean")
        return "ko"
    else if ( lang == "Marathi")
        return "mr"
    else if ( lang == "Norwegian")
        return "no"
    else if ( lang == "Persian")
        return "fa"
    else if ( lang == "Polish")
        return "pi"
    else if ( lang == "Romanian")
        return "ro"
    else if ( lang == "Portuguese")
        return "pt"
    else if ( lang == "Russian")
        return "ru"
    else if ( lang == "Serbian")
        return "sr"
    else if ( lang == "Traditional Chinese")
        return "zh"
    else if ( lang == "Slovak")
        return "sk"
    else if ( lang == "Swedish")
        return "sw"
    else if ( lang == "Tamil")
        return "ta"
    else if ( lang == "Thai")
        return "th"
    else if ( lang == "Turkish")
        return "tr"
    else if ( lang == "Ukrainian")
        return "uk"
    else if ( lang == "Urdu")
        return "ur"
    else if ( lang == "Vietnamese")
        return "vi"

    /* non funzionante, ma lo tengo per sicurezza
    switch(lang){
        else if ( lang == "Arabic":
            return "ar"
        else if ( lang == "Bulgarian":
            return "bg"
        else if ( lang == "Czech":
            return "cs"
        else if ( lang == "Danish":
            return "da"
        else if ( lang == "Dutch":
            return "nl"
        else if ( lang == "English":
            return "en"
        else if ( lang == "Finnish":
            return "fi"
        else if ( lang == "French":
            return "fr"
        else if ( lang == "German":
            return "de"
        else if ( lang == "Greek":
            return "el"
        else if ( lang == "Gujarati":
            return "gu"
        else if ( lang == "Hebrew":
            return "iw"
        else if ( lang == "Hindi":
            return "hi"
        else if ( lang == "Hungarian":
            return "hu"
        else if ( lang == "Indonesian":
            return "in"
        else if ( lang == "Italian":
            return "it"
        else if ( lang == "Japanese":
            return "ja"
        else if ( lang == "Kannada":
            return "kn"
        else if ( lang == "Korean":
            return "ko"
        else if ( lang == "Marathi":
            return "mr"
        else if ( lang == "Norwegian":
            return "no"
        else if ( lang == "Persian":
            return "fa"
        else if ( lang == "Polish":
            return "pi"
        else if ( lang == "Romanian":
            return "ro"
        else if ( lang == "Portuguese":
            return "pt"
        else if ( lang == "Russian":
            return "ru"
        else if ( lang == "Serbian":
            return "sr"
        else if ( lang == "Traditional Chinese":
            return "zh"
        else if ( lang == "Slovak":
            return "sk"
        else if ( lang == "Swedish":
            return "sw"
        else if ( lang == "Tamil":
            return "ta"
        else if ( lang == "Thai":
            return "th"
        else if ( lang == "Turkish":
            return "tr"
        else if ( lang == "Ukrainian":
            return "uk"
        else if ( lang == "Urdu":
            return "ur"
        else if ( lang == "Vietnamese":
            return "vi"
    }*/
}

module.exports.convertfilter = convertFilter;