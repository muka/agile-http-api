
var config = require("./config.json");
var d = require("debug")("agile:http");

var express = require("express");
var bodyParser = require("body-parser");

var dbus = require("./lib/dbus");

var startServer = function(app) {

  app = app || express();

  app.use(bodyParser.json());

  // TODO implement token based authentication here (?)
  app.use(function(req, res, next) {

    if(!req.headers.Authorization ||
        req.headers.Authorization.indexOf('Bearer') === -1) {
      return res.sendStatus(401);
    }

    next();
  });

  /**
   * Translates HTTP call to DBUS
   *
   * Patterns:
   *  - Call a function
   *      `GET MyObject/Load
   *  - Call a function with arguments
   *      `POST MyObject/Load { "arg1": "foo", "arg2": "bar" }`
   *  - Read a property
   *      `GET MyObject/Devices
   *  - Write to a property
   *      `PUT DeviceManager/Devices `raw value`
   */
  app.all(config.basePath + '/(*)/(*)', function(req, res) {

    var method = req.method;
    var params = req.params;

    res.send(req.params);
  });

  app.listen(config.port, config.host, function() {
    d("Started API at http://%s:%s%s", config.host, config.port, config.basePath);
  });

  return app;
};

module.exports.start = function() {

  dbus.loadObjects();

  startServer();
};
