/**
 * config for model
 *
 *  * @field {String} albersMapUrl
 *  * @field {Object} projection
 *  * @field {Object} [options]
 *      * @field {Number} [scale]
 *      * @field {Array} [rotate]
 *      * @field {Array} [center]
 *      * @field {Array} [parallels]
 *
 */
define(function (require) {

var config =  {

    RUSSIA: {
        albersMapUrl: getUrl("russia_1e-7sr.json", "topojson"),

        projection: {
            scale: 700,
            rotate: [-96, 0],
            center: [-10, 65],
            parallels: [52, 64]
        },
        options: {
            width: 960,
            height: 500
        }
    }

}

function getUrl(fileName, prefix) {
    var url = "http://localhost:8000/scripts/modules/map/";
    url += prefix;
    url += "/";
    url += fileName;

    return url;
}

return config;

});
