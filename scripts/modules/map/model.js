/**
 * This module depend on
 *
 *   * requirejs
 *   * d3.js
 *   * jQuery
 *
 *   API:
 *   * new() - return new map instance
 */
define(function (require, exports) {

var CONFIG = require("./config");

var options =  {
    "height": 960,
    "width": 500,
    "container": "body"
}

function Map() {
    this._config = null;
    this._topoJSON = null;
    this._path = null;
    this._zoomed = null;

    return this;
}

Map.prototype = {
    /**
     * @param {String} configName
     * @param {Object} [opts]
     *  @param {Number} opts.width
     *  @param {Number} opts.height
     *  @param {String|HTMLElement} opts.container
     */
    init: function Map_init(configName, opts) {
        if (!configName in CONFIG) {
            throw new Error("There is no such config", configName);
        }

        this._config = CONFIG[configName];
        //TODO: d3.ajax
        // this._topoJSON = require("./topojson/" + this._config.albers_map);
        this._topoJSON = this._config.map;
        console.log('topoJSON', this._topoJSON);

        this._opts = $.extend({}, options, this._config.options || {}, opts);

        this._draw(this._opts.container);
        this._bind();
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
            .selectAll("path")
            .data(geomCollection.geometries)
            .enter()
            .append("path")
            .attr("d", this._path)
            .style("fill", this._fillRegion.bind(this));
    },

    //TODO:
    _fillRegion: function Map__fillRegion() {
        return "#a0000e";
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
            console.log("d", d, this);
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
    new: function () {
        return new Map();
    }
}

return module;

})
