require.config({
    baseUrl: 'scripts/modules',
    paths: {
        map: "map"
    }
});

requirejs(["map/model"], function (map) {
    console.log(map);

    $(function () {
        var myMap = map.new();

        myMap.init("RUSSIA", {
            width: 960,
            height: 500
        });
    });
});
