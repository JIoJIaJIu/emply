/**
 * depend 
 *  d3.js
 *  d3-timeline
 *  jQuery
 */
define(function () {

/**
 * Options
 *  @option {Number} width
 *  @option {Number} height
 *  @option {String} container
 *  @option {Boolean} stack
 *  @option {Number} marginHeight
 *  @option {Number} itemHeight
 *  @option {Number} tickCount
 *  @option {Boolean} showBorderLime
 */
var options = {
    width: 300,
    height: 200,
    container: "body",
    stack: true,
    tickCount: 20,
    showBorderLine: false
}
var CONTEXT = this;
var HOUR = 1000 * 60 * 60;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = WEEK * 4;
var YEAR = MONTH * 12;

function Timeline() {
    this._svg = null;
    this._opts = null;
    this._chart = null;
}

Timeline.prototype = {
    init: function Timeline_init(opts, cb) {
        this._opts = $.extend({}, options, opts);
        if (!this._opts.jsonUrl)
            throw new Error("Should point jsonUrl option");

        this._draw(this._opts.container, function () {
            this._bind();
        });
    },

    finalize: function Timeline_finalize() {
        this._svg = null;
        this._opts = null;
        this._chart = null;
    },

    _draw: function Timeline__draw(container, cb) {
        var chart = this._chart = d3.timeline();

        if (this._opts.stack)
            chart.stack();

        if (typeof this._opts.itemMargin !== "undefined")
            chart.itemMargin(this._opts.itemMargin);

        if (this._opts.itemHeight)
            chart.itemHeight(this._opts.itemHeight);

        if (this._opts.showBorderLine)
            chart.showBorderLine();

        this._svg = d3.select(container)
            .append("svg")
            .attr("class", "timeline");

        chart.width(this._opts.width);
        chart.height(this._opts.height);

        this._svg.attr("width", this._opts.width)
                 .attr("height", this._opts.height);

        var that = this;
        d3.json(this._opts.jsonUrl, function (err, json) {
            if (err)
                throw new Error("Couldn't load " + that._opts.jsonUrl + " " + err);

            var data = new DataWrapper(json, "Jobs").getJSON();

            that._setChatFormat(data);
            that._svg.datum(data).call(chart);
            if (typeof cb === "function")
                cb.call(that);
        })
    },

    _bind: function Timeline__bind() {
        this._chart.hover(function (d, i, datum) {
        });
    },

    _setChatFormat: function Timeline__setChatFormat(data) {
        var tickCount = this._opts.tickCount;
    
        var format = {
            tickSize: 6
        }

        var maxDiff = 0;
        for (var i = 0; i < data.length; i++){ 
            var row = data[i];
            for (var j = 0, length = row.times.length; j < length; j++) {
                var times = row.times[j];
                var diff = (times.ending_time || (new Date())) - times.starting_time;
                if (diff > maxDiff)
                    maxDiff = diff;
            }
        }

        if (maxDiff < DAY * tickCount) {
            format.format = d3.time.format("%e.%m");
            format.tickTime = d3.time.day;
        } else if (maxDiff < WEEK * tickCount) {
            format.format = d3.time.format("%e.%m");
            format.tickTime = d3.time.week;
        } else {
            format.format = d3.time.format("%m.%y");
            format.tickTime = d3.time.year;
        }

        this._chart.tickFormat(format);
    },
}

/**
 * @param {String} json
 * @param {String} type = Enum("Jobs",`)
 */
function DataWrapper(json, type) {
    this._json = json;
    this._type = type;
    this._normalizedJSONObj = null;
}

DataWrapper.prototype = {
    /*
     * Return JSON in format
     *
     *  {label: "Label 1", id: "id_1", times: [
     *      {"starting_time": 1355752800000, "ending_time": 1355759900000}, 
     *      {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
     *  {label: "Label 2", id: "id_2", times: [
     *      {"starting_time": 1355759910000, "ending_time": 1355761900000}]},
     *  {label: "Label 3", id: "id_3", times: [
     *      {"starting_time": 1355761910000, "ending_time": 1355763910000}]},
     *  ];
     */

    getJSON: function DataWrapper_getJSON() {
        if (!this._normalizedJSONObj)
            this._normalize();
        
        return this._normalizedJSONObj;
    },

    _normalize: function DataWrapper__normalize() {
        var normalizerName = this._type + "Normalizer";
        var normalizer = CONTEXT[normalizerName];
        if (!normalizer)
            throw new Error("There is no such normalizer " + normalizerName);

        this._normalizedJSONObj = normalizer(this._json);
    }
}

this.JobsNormalizer = function JobsNormalizer(json) {
    var obj = json;
    var list = []; 

    for (var i = 0, length = obj.jobs.length; i < length; i++) {
        var job = obj.jobs[i];
        var template = {};
        template.label = job.job_name || "";
        // Mb better class?
        template.id = job.job_id;
        template.times = [{
            starting_time: (new Date(job.start_date)).getTime(),
            ending_time: (job.end_date) ? (new Date(job.end_date)).getTime() : (new Date()).getTime()
        }];

        list.push(template);
    }

    return list;
}

var module = {
    new: function () {
        return new Timeline();
    }
}

return module;

});
