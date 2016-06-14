var m = module.exports;

var d = require('debug')("agile:dbus");
var dbus = require('dbus-native');
var _ = require('lodash');
var config = require('../config.json');

var sessionBus = dbus.sessionBus();
var dbusConn = sessionBus.connection;

dbusConn.on("error", function(err) {
  d('exception occured %s', err.message);
});

// dbusConn.on('message', function(msg) {
//     d("Bus message %j", msg);
// });

var managedObjects = {};
var objmap = {};

m.disconnect = function() {
  try {
    d("Disconnect from DBus");
    if(sessionBus.connection)
      sessionBus.connection.end();
  }
  catch(e) {
    console.warn(e);
  }
};

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


          dbusObject.GetNameOwner(list[0], function(err, res) {
            console.warn(res);
          });



          // filterObjects(list);
        });

      });
};

var filterObjects = function(all) {

  var regexps = [];
  _.each(config.namespaces, function(ns) {
    var nsreg = ns.replace('.', '\\.').replace('*', '(.*)');
    d('Added namespace match for /%s/', nsreg);
    regexps.push(new RegExp( "("+ nsreg +")" , 'i'));
  });

  // managedObjects
  var managed = _.filter(all, function(val, key) {

    var res = regexps.filter(function(regex) {
      return val.match(regex);
    });

    var keep = res.length > 0;
    d("%s %s", keep ? 'Keep' : 'Drop', val);
    return keep;
  });

  d("Managed objects %j", managed);

  // managed.forEach(registerObject);
  registerObject(managed.pop());
};

var registerObject = function(ns, then) {

  if(managedObjects[ns]) {
    d("DBus client already managed for %s", ns);
    return;
  }

  var objPath = '/' + ns.replace(/\./g, '/');
  d("Registering DBus client for %s %s", ns, objPath);

  try {

    var service = sessionBus
      .getService(ns)
      .getObject(objPath, function(err, obj) {
        d("Loaded %s", ns);
        console.log(require('util').inspect(obj, { depth: 2 }));

      });

  }
  catch(e) {
    console.error("Error loading service", e);
  }


};
