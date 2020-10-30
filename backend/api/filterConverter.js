function convertFilter(filter){

    let APIfilter = {
        standardfilter: filter.words.all.toString().replace(/,/g, " "),
        exact: `"${filter.words.exact.toString().replace(/,/g, " ")}"`,
        any: filter.words.any.toString().replace(/,/g, " ").replace(/ /g, " OR "),
        none: `-${filter.words.none.toString().replace(/,/g, " -")}`,
        hashtags: filter.words.hashtags.toString().replace(/,/g, " "),
        lang: convertLang(filter.words.language),
        from: `from:${filter.accounts.from.toString().replace(/@/g, "").replace(",", " from:")}`,
        to: `to:${filter.accounts.to.toString().replace(/@/g, "").replace(",", " to:")}`,
        mention: filter.accounts.mentioning.toString().replace(/,/g, " "),
        since: `since:${filter.dates.from.toString().replace(/,/g, " ")}`,
        until: `until:${filter.dates.to.toString().replace(/,/g, " ")}`,
        links: hasLinks(filter.filters)
    }
    return APIfilter
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

function hasLinks(filters){
    if((filters.links == true) && filters.linksValue == "include-links"){
        return 'has:links'
    }
}

module.exports.convertfilter = convertFilter()