
var config = require("./config.json");
var d = require("debug")("agile:http");

var express = require("express");
var bodyParser = require("body-parser");
var app = express();


var startServer = function() {

  app.use(bodyParser.json());

  // TODO implement authentication
  app.use(function(req, res, next) {

    // if(!req.headers.Authorization) {
    //   return res.sendStatus(401);
    // }

    next();
  });

  // /api/DeviceManager/Load
  app.all(config.basePath + '/(*)/(*)', function(req, res) {

    var method = req.method;
    var params = req.params;

    res.send(req.params);
  });

  app.listen(config.port, config.host, function() {
    d("Started API at http://%s:%s%s", config.host, config.port, config.basePath);
  });
};

module.exports.start = function() {
  startServer();
};
