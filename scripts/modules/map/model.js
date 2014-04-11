/**
 * This module depend on
 *
 *   * requirejs
 *   * d3.js
 *   * jQuery
 *
 *   API:
 *   * new(configName) - return new map instance
 */
define(function (require, exports) {

var CONFIG = require("./config");

var options =  {
    "height": 960,
    "width": 500,
    "container": "body"
}

/**
 *  * @param {String} configName
 **/
function Map(configName) {
    if (!configName in CONFIG) {
        throw new Error("There is no such config", configName);
    }

    this._config = CONFIG[configName];
    this._topoJSON = null;
    this._path = null;
    this._zoomBehavior = null;

    return this;
}

Map.prototype = {
    /**
     * @param {Object} [opts]
     *  @param {Number} opts.width
     *  @param {Number} opts.height
     *  @param {String|HTMLElement} opts.container
     * @param {Function} callback
     */
    init: function Map_init(opts, cb) {
        this._opts = $.extend({}, options, this._config.options || {}, opts);
        this._computeViewSize();

        var that = this;
        d3.json(this._config.albersMapUrl, function (err, data) {
            if (err) {
                throw new Error("Couldn't load json " + url + " " + err);
            }

            that._topoJSON = data;
            that._draw(that._opts.container, function () {
                that._bind();

                if (typeof cb === "function")
                    cb();
            });
        });
    },

    finalize: function Map_finalize() {
        this._unbind();

        this._config = null;
        this._topoJSON = null;
        this._path = null;
        this._zoomBehavior = null;
    },

    _draw: function Map__draw(container, cb) {
        this._svg = d3.select(container).append("svg");

        var width = this._opts.width;
        var height = this._opts.height;

        var projection = d3.geo.albers();

        if (this._config.projection) {
            var cProj = this._config.projection;
            if (cProj.scale)
                projection.scale(cProj.scale)

            if (cProj.rotate)
                projection.rotate(cProj.rotate)

            if (cProj.center)
                projection.center(cProj.center)

            if (cProj.parallels)
                projection.parallels(cProj.parallels)
        }

        projection.translate([width / 2, height / 2]);

        this._path = d3.geo.path().projection(projection);
        this._svg.attr("width", this._opts.width)
                 .attr("height", this._opts.height);

        var geomCollection = topojson.object(this._topoJSON, this._topoJSON.objects.regions);
        this._svg.append("g")
            .attr("class", "main")
            .selectAll("path")
            .data(geomCollection.geometries)
            .enter()
            .append("path")
            .attr("d", this._path);

        this._drawCapitals(function () {
            if (typeof cb === "function")
                cb();
        });
    },

    _drawCapitals: function Map__drawCapitals(cb) {
        var csvUrl = this._config.capitalsCsvUrl;
        if (!csvUrl)
            return;

        var that = this;
        var projection = this._path.projection();
        d3.csv(csvUrl, function (err, csv) {
            if (err)
                throw new Error("Couldn't get csv " + csvUrl + " " + err);

            var city = that._svg.append("g").attr("class", "cities")
                .selectAll("g.city")
                .data(csv)
                .enter()
                .append("g")
                .attr("class", function (d) {
                    var className = "city city-" + d.code;

                    if (d.population > 1000000)
                        className += " big";
                    return className;
                })
                .attr("transform", function (d) {
                    return  "translate(" + projection([d.lon, d.lat]) + ")";
                });

            city.append("circle")
                .attr("r", 2)
                .attr("class", function (d) {
                    return "point point-" + d.code;
                })

            city.append("text")
                .text(function (d) {
                    return d.capital;
                })
                .attr("transform", "translate(4, 0)");

            if (typeof cb === "function")
                cb();
        });
    },

    _bind: function Map__bind() {
        var that = this;
        var path = this._svg.selectAll("path");

        path.on("mouseover", function () {
            var self = d3.select(this);

            self.transition()
                .duration(300)
                .style("opacity", 0.8);
        });

        path.on("mouseout", function () {
            var self = d3.select(this);

            self.transition()
                .duration(300)
                .style("opacity", 1);
        });

        this._zoomBehavior = d3.behavior.zoom();

        if (this._config.projection && this._config.projection.scale)
                this._zoomBehavior.scale(this._config.projection.scale);

        this._zoomBehavior.translate([this._opts.width / 2, this._opts.height / 2]);

        this._svg.call(this._zoomBehavior);
        this._zoomBehavior.on("zoom", this._zoom.bind(this));
    },

    __unbind: function Map__unbind() {
        this._svg.selectAll("path").off();
        this._zoomBehavior.on("zoom", null);
    },

    _zoom: function Map_zoom() {
        var g = this._svg.select("g.main");

        var translate = d3.event.translate;
        var scale = d3.event.scale;
        if (this._config.projection && this._config.projection.scale)
            scale /= this._config.projection.scale;

        var x = translate[0]
        var y = translate[1];

        var transform = "translate(" +
                 x + ", " + y + ") " +
                "scale(" + scale + ") " + 
                "translate(" +
                    (-this._opts.width / 2) + ", " +
                    (-this._opts.height / 2) + ")";


        g.attr("transform", transform);
        this._zoomCities();
    },

    _zoomCities: function Map_zoomCities() {
        var g = this._svg.select("g.cities");
        var projection = this._path.projection();

        console.log(d3.event.scale, d3.event.translate);
        projection.scale(d3.event.scale)
                  .translate(d3.event.translate);


        g.selectAll("g.city")
         .attr("transform", function (d) {
            return  "translate(" + projection([d.lon, d.lat]) + ")";
         });

        var zoomed = (d3.event.scale / 2 > (this._config.projection.scale || 1)) ? true : false;
        g.classed("zoomed", function (d) {
             if (zoomed)
                 return true

             return false;
         });
    },

    _computeViewSize: function Map__computeViewSize() {
        if (/.+%$/.test(String(this._opts.width))) {
            var percent = parseInt(this._opts.width, 10) / 100;
            this._opts.width = document.body.clientWidth * percent;
        }

        if (/.+%$/.test(String(this._opts.height))) {
            var percent = parseInt(this._opts.height, 10) / 100;
            this._opts.height = document.body.clientHeight * percent;
        }
    }

}

var module = {
    new: function (configName) {
        return new Map(configName);
    }
}

return module;

})
