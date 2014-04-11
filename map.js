(function () {
var fs = require('fs');

var file = process.argv[2];
if (!file)
    throw new Error("Should point source file");

var mapFile = process.argv[3];
if (!mapFile)
    throw new Error("Should point map file");

var output = process.argv[4];
if (!output)
    throw new Error("Should point output file");

fs.readFile(file, function (err, data) {
    if (err)
        throw err;

    var json = JSON.parse(data);
    fs.readFile(mapFile, function (err, data) {
        if (err)
            throw err;

        var csv = parseCsv(data.toString())
        json.objects.regions.geometries.forEach(function (region) {
            var index = find(csv, region.properties.region);
            if (!~index)
                return;

            var id = csv[index].id
            if (typeof id !== 'undefined')
                region.properties.id = id
        });

        fs.writeFile(output, JSON.stringify(json), function (err) {
            if (err)
                throw err
        });
    });
});

function find(csv, regionName) {
    for (var i = 0, length = csv.length; i < length; i++) {
        if (csv[i].region === regionName)
            return i;
    }
}

function parseCsv(str) {
    var lines = str.split("\n");
    var row = lines.shift();
    var data = []

    var keys = row.split(",");
    while (lines.length) {
        row = lines.shift();
        if (!row)
            continue;
        row = row.split(",");

        var obj = {};
        keys.forEach(function (key, i) {
            obj[key] = row[i]
        });
        data.push(obj);
    }

    return data;
}

})();
