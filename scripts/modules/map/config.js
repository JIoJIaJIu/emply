/**
 * config for model
 *
 *  * @field {String} albers_map 
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
        albers_map: "russia_1e-7sr.js",
        // TODO:
        map: require("./topojson/russia_1e-7sr"),

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

return config;

});
