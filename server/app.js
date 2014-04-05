var express = require("express");

var app = express();

app.use(express.bodyParser());
app.use(express.logger());
app.use(express.static(__dirname + "/../"));

app.listen(8000)
