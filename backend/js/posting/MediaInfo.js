class MediaInfo {
    /**
     *
     * @param metaInfo {String}
     * @param data {Buffer}
     * @param mime {String}
     */
    constructor( metaInfo, data, mime ) {
        this.metaInfo = metaInfo
        this.data = data;
        this.mime = mime;
    }
}

module.exports = MediaInfo;