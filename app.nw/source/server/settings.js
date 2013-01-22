var nconf = require('nconf');
// require local Watch package (watchr)
var watch = require('./watch.js');
// require local Tray package (node-webkit's tray)
var trayMenu = require('./traymenu.js');

var currentSettingsFile;

function file (f){
  nconf.file(f);
  currentSettingsFile = f;
}

function read (callback){
  nconf.load(function () {
    var loadedSettings = [{}];
    var i = -1;

    var conf = nconf.get();
    if (conf){
      for(var key in conf) {
        i++;
        loadedSettings.push({});
        // unescape path (escaped in the json)
        loadedSettings[i]['path'] = unescape(key);
        // console.log('key: ' + key + '\n' + 'value: ' + conf[key]);
        for(var key2 in conf[key]) {
          loadedSettings[i]['serverId'] = key2;
          for(var key3 in conf[key][key2]) {
            loadedSettings[i]['apiKey'] = conf[key][key2]['apikey'];
            loadedSettings[i]['templateId'] = conf[key][key2][key3]['id'];
            // unescape template name (escaped in the json)
            loadedSettings[i]['templateName'] = unescape(conf[key][key2][key3]['name']);
          }
        }
        // console.log('- ' + i + ' -------------------');
        // console.log('path: ' + loadedSettings[i]['path'] + ' - serverId: ' + loadedSettings[i]['serverId'] + ' - apiKey: ' + loadedSettings[i]['apiKey'] + ' - templateId: ' + loadedSettings[i]['templateId'] + ' - templateName: ' + loadedSettings[i]['templateName']);
      }

      callback(undefined, loadedSettings);
    } else {
      callback('Error loading settings from ' + currentSettingsFile);
    }
  });
}

/*
HOW TO USE:

settings.save(templateSettings, function (err, file){
  if (err) {
    console.error(err);
    return;
  }
  console.log('Configuration saved successfully in ' + file);
});
*/
function save (templateSettings, callback){
  // check if all the settings are set
  for (var name in templateSettings) {
    console.log(name + ": " + templateSettings[name]);
    if(!templateSettings[name] || templateSettings[name]===''){
      callback(name + ' is not defined');
      return;
    }
  }

  // clear the current entry to make sure there is only 1 server for each watched path
  // this will have to be removed and worked around if we want to manage multiple servers (c, q, s, etc.) for each path
  nconf.clear(templateSettings.path, function(){
    // fix path on Windows by escaping it (and avoid nconf splitting the string on ':')
    templateSettings.path = escape(templateSettings.path);
    // and escape the template name, as it is free form and could contain colons
    templateSettings.templateName = escape(templateSettings.templateName);

    // set the settings for the current path
    nconf.set(templateSettings.path + ':' + templateSettings.serverId + ':apikey', templateSettings.apiKey);
    nconf.set(templateSettings.path + ':' + templateSettings.serverId + ':template:id', templateSettings.templateId);
    nconf.set(templateSettings.path + ':' + templateSettings.serverId + ':template:name', templateSettings.templateName);

    nconf.save(function (err){
      if (err) {
        console.error(err.message);
        callback(err.message);
        return;
      } else {
        console.log('Configuration saved successfully in ' + currentSettingsFile);
        callback(undefined, currentSettingsFile);
      }
    });
  });
}

// removes the specified key (and below tree) from settings.json
function clear (key, callback) {
  console.log("SETTINGS clear: " + key);
  nconf.clear(key, function () {
    nconf.save(function (err){
      if (err) {
        console.error(err.message);
        callback(err.message);
        return;
      } else {
        console.log('Configuration saved successfully in ' + currentSettingsFile);
        callback(undefined);
      }
    });
  });
}

// Helper function. Will read settings.json, populate tray and start watchr
function loadAndWatchFolders() {
  read(function (err, loadedSettings){
    if (err) {
      console.error(err);
      return;
    }
    // if settings were correctly loaded
    console.log('Configuration loaded successfully: ' + loadedSettings);
    var pathsToWatch = [];
    // if there's any watched folder loaded from the settings
    if (loadedSettings.length>1) {
      // for each watched folder
      for (var i=0; i<loadedSettings.length-1; i++) {
        // add one tray menu entry
        trayMenu.addWatchedFolder(loadedSettings, i);
        // get every paths loaded
        pathsToWatch.push(loadedSettings[i]['path']);
      }
    }
    // make sure we reset watched folders (if any)
    watch.stop();
    // and watch paths
    watch.start(pathsToWatch, loadedSettings);
  });
}

exports.file = file;
exports.read = read;
exports.save = save;
exports.clear = clear;
exports.loadAndWatchFolders = loadAndWatchFolders;