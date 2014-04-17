require.config({
    baseUrl: 'scripts/modules',
    paths: {
        map: "map"
    }
});

var route = {
    init: function route_init() {
        var hash = document.location.hash;

        var key = "init";
        switch (hash) {
            case "#timeline":
                key = "timeline";
                break;
            default:
                break;
        }

        $(window).bind("hashchange", function () {
            window.location.reload();
        });
        this._controllers[key]();
    },

    _controllers: {
        init: function () {
            $("body").addClass("index");
            requirejs(["map/model", "map/decorators/heatMap"], function (map, heatMap) {
                $(function () {
                    var myMap = map.new("RUSSIA");
                    heatMap.decorate(myMap);

                    myMap.init({
                        width: "100%",
                        height: "100%"
                    });
                });
            });
        },

        timeline: function () {
            $("body").addClass("timeline");
            $("body").append($("<div id='timeline1'/>")).append($("<div id='timeline2'/>"))
                     .append($("<div id='timeline3'/>")).append($("<div id='timeline4'/>"));
            $.getScript("scripts/3dparty/d3-timeline.js", function () {
                requirejs(["timeline/model"], function (timelineModule) {
                    $(function () {
                        var timeline1 = timelineModule.new();
                        timeline1.init({
                            container: "#timeline1",
                            width: 1000,
                            height: 100,
                            itemMargin: 0,
                            itemHeight: 15,
                            jsonUrl: "scripts/modules/timeline/json/data.json"
                        }); 

                        var timeline2 = timelineModule.new();
                        timeline2.init({
                            container: "#timeline2",
                            width: 1000,
                            height: 100,
                            itemMargin: 0,
                            itemHeight: 15,
                            jsonUrl: "scripts/modules/timeline/json/data1.json"
                        }); 

                        var timeline3 = timelineModule.new();
                        timeline3.init({
                            container: "#timeline3",
                            width: 1000,
                            height: 150,
                            showBorderLine: true,
                            itemHeight: 15,
                            jsonUrl: "scripts/modules/timeline/json/data2.json"
                        }); 

                        var timeline4 = timelineModule.new();
                        timeline4.init({
                            container: "#timeline4",
                            width: 1000,
                            height: 150,
                            jsonUrl: "scripts/modules/timeline/json/data3.json"
                        }); 
                    });
                });
            });
        }
    }
}


route.init();
