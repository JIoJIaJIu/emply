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
                that._loadData(function (err, rows) {
                    if (err) 
                        throw new Error("Couldn't load data " + err);

                    var data = {};
                    for (var i = 0, length = rows.length; i < length; i++) {
                        var row = rows[i];
                        data[row.id] = row.value;
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
                var id = d.properties.id;
                if (typeof id === "undefined") {
                    return that._color(0);
                }

                var value = that._color(data[id]) || that._color(0);
                return value;
            });
    },

    _loadData: function heatMapDecorator__loadData(cb) {
        var type = this._opts.data.type;
        var url = this._opts.data.url;
        var func;

        switch (type) {
            case "json":
                func = d3.json;
                break;
            case "csv":
                func = d3.csv;
                break;
            default:
                throw new Error("Wrong type " + type);
                break;
        }

        func.call(d3, url, cb);
    }
}

var module = {
    decorate: function (obj) {
        return new heatMapDecorator(obj);
    }
}

return module;
});
