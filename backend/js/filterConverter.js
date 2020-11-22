function convertFilter(filter){

    let query = "";
    if( filter ) {
        if( filter.keywords ) {
            if( filter.keywords.all && filter.keywords.all.length > 0 ) {
                query += ` ${ filter.keywords.all.join( " " )}`;
            }
            if( filter.keywords.exact && filter.keywords.exact.length > 0 ) {
                query += ` "${filter.keywords.exact.join( " " )}"`;
            }
            if( filter.keywords.any && filter.keywords.any.length > 0 ) {
                query += ` ${ filter.keywords.any.join( " OR " )}`;
            }
            if( filter.keywords.none && filter.keywords.none.length > 0 ) {
                query += ` -${filter.keywords.none.join( " -" )}`;
            }

            if( filter.keywords.hashtags && filter.keywords.hashtags.length > 0 ) {
                filter.keywords.hashtags.forEach( (item, key, array) => array[ key ] = item.replace(/#/g, "") )
                query += ` #${filter.keywords.hashtags.join( " #" )}`;
            }

        }

        if( filter.accounts ) {
            if( filter.accounts.authors && filter.accounts.authors.length > 0 ) {
                filter.accounts.authors.forEach( (item, key, array) => array[ key ] = item.replace(/@/g, "") )
                query += ` from:${filter.accounts.authors.join( " from:")}`;
            }
            if( filter.accounts.replied && filter.accounts.replied.length > 0 ) {
                filter.accounts.replied.forEach( (item, key, array) => array[ key ] = item.replace(/@/g, "") )
                query += ` to:${filter.accounts.replied.join( " to:")}`;
            }
            if( filter.accounts.mentioning && filter.accounts.mentioning > 0 ) {
                filter.accounts.mentioning.forEach( (item, key, array) => array[ key ] = item.replace(/@/g, "") )
                query += ` @${filter.accounts.mentioning.join( " @")}`;
            }
        }

        if( filter.dates ) {
            if( filter.dates.since ) {
                query += ` since:${ filter.dates.since }`;
            }
            if( filter.dates.until ) {
                query += ` until:${ filter.dates.until }`;
            }
        }

        if( filter.context ) {
            if( filter.context.language ) {
                query += ` lang:${filter.keywords.language}`;
            }
            if( filter.context.entities && filter.context.entities.length > 0 ) {
                query += ` entity:${filter.context.entities.join( " entity:" )}`;
            }
        }

        if( filter.filters ) {
            if( filter.filters.links ) {
                query += ` filter:links`;
            }
            if( filter.filters.linksValue ) {
                query += ` url:${filter.filters.linksValue}`;
            }
        }

        query = query.trim();
    }
    return query;
}

module.exports.convertfilter = convertFilter;