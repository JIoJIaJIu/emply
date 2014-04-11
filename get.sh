#!/bin/bash
isForce=

case $1 in
    --force)
        echo "Force"
        rm -rvf src
        rm -rf node_modules
        isForce=true
    ;;
esac


if [ ! -d src ]; then
    mkdir -p src
fi

DATA_URL="http://gis-lab.info/data/rusbounds-rosreestr/regions2010_alb_shp.7z"
DATA="regions.7z"
DATA_DIR="7z"
GEOJSON_FILE="regions.geojson"
TOPOJSON_FILE="regions.topojson"

if [ $isForce ] || [ ! -f src/$DATA ]; then
    echo "Downloading shapefile.."
    wget $DATA_URL -O src/$DATA 2>&1
    if [ $? -ne 0 ]; then
        rm src/$DATA
        exit 1
    fi

    isForce=true
fi

if [ $isForce ] || [ ! -d src/$DATA_DIR ]; then
    echo "Unzip.."
    mkdir -p src/$DATA_DIR
    cd src/$DATA_DIR
    cp ../$DATA _$DATA
    p7zip -d _$DATA
    cd ../..

    isForce=true
fi

PROJECTION=albers.prj
if [ $isForce ] || [ ! -f src/$PROJECTION ]; then
    echo "Creating projections.."
    echo "http://gis-lab.info/qa/gis-lab-projections.html"
    echo "PROJ.4: +proj=aea +lat_1=52 +lat_2=64 +lat_0=0" \
         "+lon_0=105 +x_0=18500000 +y_0=0 +ellps=krass +units=m" \
         "+towgs84=28,-130,-95,0,0,0,0 +no_defs" > src/$PROJECTION

    isForce=true
fi

SHAPE_FILE=regions.shp
if [ $isForce ] || [ ! -f src/$SHAPE_FILE ]; then
    echo "Converting to WSG84.."
    ogr2ogr -f 'ESRI Shapefile' -s_srs src/$PROJECTION -t_srs EPSG:4326 src/$SHAPE_FILE src/$DATA_DIR/regions2010.shp

    isForce=true
fi

if [ $isForce ] || [ ! -f src/$GEOJSON_FILE ]; then
    echo "Getting GeoJSON.."
    ogr2ogr -f GeoJSON src/_$GEOJSON_FILE src/$SHAPE_FILE
    echo "Changing encoding.."
    echo "Read http://habrahabr.ru/post/181766/"
    if [ -f src/$GEOJSON_FILE ]; then
        rm src/$GEOJSON_FILE
    fi
    iconv -f MIK -t UTF8 src/_$GEOJSON_FILE -o src/$GEOJSON_FILE
    sed -i "s/├//g" src/$GEOJSON_FILE

    isForce=true
fi

TOPOJSON_CLI=./node_modules/topojson/bin/topojson
STEREDIANS=1e-7
if [ $isForce ] || [ ! -f src/$TOPOJSON_FILE ]; then
    if [ ! `which $TOPOJSON_CLI` ]; then
        echo "Installing topojson.."
        npm install topojson
    fi

    if [ $? -ne 0 ]; then
        rm -rf node_modules
        exit 1
    fi

    echo "Getting TopoJSON.."
    $TOPOJSON_CLI -o src/$TOPOJSON_FILE -p -s $STEREDIANS src/$GEOJSON_FILE

    isForce=true
fi

if [ $isForce ] ; then
    echo "Adding id to regions.."
    set -x;
    node map.js src/$TOPOJSON_FILE map.csv src/$TOPOJSON_FILE;
fi
