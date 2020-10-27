export default class Position {

    constructor(
        /*double*/ latitude,
        /*double*/ longitude){
        this.latitude = latitude;
        this.longitude = longitude;
    }

    getLatitude() {
        return this.latitude;
    }

    setLatitude(/*double*/ latitude) {
        this.latitude = latitude;
    }

    getLongitude() {
        return this.longitude;
    }

    setLongitude( /*double*/ longitude) {
        this.longitude = longitude;
    }

}
