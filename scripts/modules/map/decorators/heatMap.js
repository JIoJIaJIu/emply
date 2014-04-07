define(function (require) {


function heatMapDecorator(map, opts) {
    var config = map._config.heatMap;
    var that = this;

    var methods = {
        init: function methods_init() {
            var getter = "init";
            var superMethod = map[getter];
            map[getter] = function heatMapDecorator_init() {
                if (typeof superMethod === "function")
                    superMethod.apply(this, arguments)

                that._opts = $.extend({}, config, opts);
                that._color = d3.scale.threshold().domain(that._opts.domains).range(that._opts.colors);
            }
        },

        finalize: function methods_finalize() {
            var getter = "finalize";
            var superMethod = map[getter];
            map[getter] = function heatMapDecorator_init() {
                if (typeof superMethod === "function")
                    superMethod.apply(this, arguments)

                that._opts = null;
                that._color = null;
                that.svg = null;
                map = null;
                config = null;
                that = null;
            };
        },

        _draw: function methods__draw() {
            var getter = "_draw";
            var superMethod = map[getter];
            map[getter] = function heatMapDecorator__draw() {
                if (typeof superMethod === "function")
                    superMethod.apply(this, arguments)

                that._svg = this._svg;
                d3.csv(that._opts.csvUrl, function (err, rows) {
                    if (err) 
                        throw new Error("Couldn't load csv " + that._opts.csvUrl + " " + err);

                    var data = {};
                    for (var i = 0, length = rows.length; i < length; i++) {
                        var row = rows[i];
                        data[row.code] = row.value;
                    }
                    that._fillRegions(data);
                });
            }
        }
    }

    for (var k in methods) {
        methods[k]();
    }

    return this;
}

heatMapDecorator.prototype = {
    _fillRegions: function heatMapDecorator__fillRegions(data) {
        var that = this;
        this._svg.selectAll("path").style("fill", function (d) {
                var value = that._color(data[d.properties.region]) || that._color(0);
                return value;
            });
    }
}

var module = {
    decorate: function (obj) {
        return new heatMapDecorator(obj);
    }
}

return module;
});
