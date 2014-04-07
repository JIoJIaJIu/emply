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
    this._zoomed = null;

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

        var that = this;
        d3.json(this._config.albersMapUrl, function (err, data) {
            if (err) {
                throw new Error("Couldn't load json " + url + " " + err);
            }

            that._topoJSON = data;
            that._draw(that._opts.container);
            that._bind();
            if (typeof cb === "function")
                cb();
        });
    },

    finalize: function Map_finalize() {
        this._unbind();

        this._config = null;
        this._topoJSON = null;
        this._path = null;
        this._zoomed = null;
    },

    _draw: function Map__draw(container) {
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

        // TODO:
        projection.translate([width / 2, height / 2]);

        this._path = d3.geo.path().projection(projection);
        this._svg.attr("width", this._opts.width)
                 .attr("height", this._opts.height);

        var geomCollection = topojson.object(this._topoJSON, this._topoJSON.objects.russia);
        this._svg.append("g")
            .attr("class", "main")
            .selectAll("path")
            .data(geomCollection.geometries)
            .enter()
            .append("path")
            .attr("d", this._path);

        this._drawCapitals(projection);
    },

    _drawCapitals: function Map__drawCapitals(projection) {
        var csvUrl = this._config.capitalsCsvUrl;
        if (!csvUrl)
            return;

        var that = this;
        d3.csv(csvUrl, function (err, csv) {
            if (err)
                throw new Error("Couldn't get csv " + csvUrl + " " + err);

            var city = that._svg.select("g.main").selectAll("g.city")
                .data(csv)
                .enter()
                .append("g")
                .attr("class", "city")
                .attr("transform", function (d) {
                    return  "translate(" + projection([d.lon, d.lat]) + ")";
                });

            city.append("circle")
                .attr("r", 3)
                .style("fill", "white")
                .style("stroke", "#000000")
                .style("opacity", 0.75);

            city.append("text")
                .text(function (d) {
                    return d.capital;
                });
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

        path.on("click", function (d) {
            that._zoom(d);
        });
    },

    __unbind: function Map__unbind() {
        this._svg.selectAll("path").off();
    },

    _zoom: function Map_zoom(d) {
        if (this._zoomed === d) {
            this._zoomOut(d)
        } else {
            this._zoomIn(d);
        }
    },

    _zoomIn: function Map__zoomIn(d) {
        var g = this._svg.select("g");

        var centroid = this._path.centroid(d);
        var bounds = this._path.bounds(d);

        var dx = bounds[1][0] - bounds[0][0];
        var dy = bounds[1][1] - bounds[0][1];
        var scale = 1 / Math.max(dx / this._opts.width, dy / this._opts.height);

        var x = this._opts.width / 2 - centroid[0] * scale;
        var y = this._opts.height / 2 - centroid[1] * scale;
        var transform = "translate(" +
                x + ", " + y + ") " +
                "scale(" + scale + ") ";

        g.interrupt()
         .transition()
         .duration(750)
         .attr("transform", transform);

        this._zoomed = d;
    },

    _zoomOut: function Map__zoomOut(d) {
        var g = this._svg.select("g");

        g.interrupt()
         .transition()
         .duration(750)
         .attr("transform", "");

        this._zoomed = null;
    }
}

var module = {
    new: function (configName) {
        return new Map(configName);
    }
}

return module;

})
