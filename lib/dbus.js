var m = module.exports;

var d = require('debug')("agile:dbus");
var dbus = require('dbus-native');
var _ = require('lodash');
var config = require('../config.json');

var sessionBus = dbus.sessionBus();


var managedObjects = {};
var objmap = {};

/**
 * List all object names registered in DBus
 */
m.loadObjects = function () {
  d("Load DBus objects");
  sessionBus
    .getService('org.freedesktop.DBus')
    .getInterface(
      '/org/freedesktop/DBus',
      'org.freedesktop.DBus',
      function (err, dbusObject) {

        if(err) {
          console.error("Exception loading DBus interface: %s", err.message);
          throw err;
        }

        dbusObject.ListNames(function(err, list) {
          if(err) {
            console.error("Exception calling DBus.ListNames: %s", err.message);
            throw err;
          }
          filterObjects(list);
        });

      });
};

var filterObjects = function(all) {

  var regexps = [];
  _.each(config.namespaces, function(ns) {
    var nsreg = ns.replace('.', '\\.').replace('*', '(.+)');
    d('Added namespace match for /%s/', nsreg);
    regexps.push(new RegExp( "("+ nsreg +")" , 'i'));
  });

  // managedObjects
  var managed = _.filter(all, function(val, key) {

    var res = regexps.filter(function(regex) {
      return val.match(regex);
    });

    var keep = res.length > 0;

    if(keep) {
      registerObject(val);
    }

    return keep;
  });

  d("Managed objects %j", managed);
};

var registerObject = function(ns) {

  if(managedObjects[ns]) {
    d("DBus client already managed for %s", ns);
    return;
  }

  d("Registering DBus client for %s", ns);

    var service = sessionBus
      .getService(ns);

      // service.getInterfaced(ns.replace('.', '/'));


};
