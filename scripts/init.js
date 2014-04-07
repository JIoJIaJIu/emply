require.config({
    baseUrl: 'scripts/modules',
    paths: {
        map: "map"
    }
});

requirejs(["map/model", "map/decorators/heatMap"], function (map, heatMap) {
    $(function () {
        var myMap = map.new("RUSSIA");
        heatMap.decorate(myMap);

        myMap.init({
            width: 960,
            height: 500
        });
    });
});
