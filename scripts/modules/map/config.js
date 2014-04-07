/**
 * config for model
 *
 *  * @field {String} albersMapUrl
 *  * @field {Object} projection
 *  * @filed {String} [capitalsCsvUrl]
 *  * @field {Object} [options]
 *      * @field {Number} [scale]
 *      * @field {Array} [rotate]
 *      * @field {Array} [center]
 *      * @field {Array} [parallels]
 *  * @field {Object} [heatMap]
 *      * @field {String} csvUrl
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

        capitalsCsvUrl: getUrl("region.csv", "csv"),
        options: {
            width: 960,
            height: 500
        },

        heatMap: {
            csvUrl: getUrl("vacancy.csv", "csv"),
            domains: [300, 500, 1000, 1500, 2000, 2500],
            colors: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]
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
