
var config = require("./config.json");
var d = require("debug")("agile:http");

var dbus = require("./lib/dbus");
var server = require("./lib/server");

module.exports.start = function() {
    dbus.loadObjects();
    server.start();
};

process.on('exit', function() {
  dbus.disconnect();
});
