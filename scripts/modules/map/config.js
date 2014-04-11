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
 *      * @field {Object} data
 *          * @field {String} url
 *          * @filed {String} type "json"|"csv"
 *
 */
define(function (require) {

var config =  {

    RUSSIA: {
        albersMapUrl: getUrl("russia_1e-7sr.json", "topojson"),

        projection: {
            scale: 800,
            rotate: [-96, 0],
            center: [0, 65],
            parallels: [52, 64]
        },

        capitalsCsvUrl: getUrl("region.csv", "csv"),
        options: {
            width: 960,
            height: 500
        },

        heatMap: {
            data: {
                url: getUrl("vacancy.json", "json"),
                type: "json"
            },
            domains: [5, 50, 100, 200, 500, 5000],
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
