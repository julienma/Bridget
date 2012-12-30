var nconf = require('nconf');

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
      // TODO - loop through all the values, and start watchr + create new tray menu (for deletion) for each

      for(var key in conf) {
        i++;
        loadedSettings.push({});
        loadedSettings[i]['path'] = key;
        console.log('key: ' + key + '\n' + 'value: ' + conf[key]);
        for(var key2 in conf[key]) {
          loadedSettings[i]['serverId'] = key2;
          for(var key3 in conf[key][key2]) {
            loadedSettings[i]['apiKey'] = conf[key][key2]['apikey'];
            loadedSettings[i]['templateId'] = conf[key][key2][key3]['id'];
            loadedSettings[i]['templateName'] = conf[key][key2][key3]['name'];
          }
        }
        console.log('- ' + i + ' -------------------');
        console.log('path: ' + loadedSettings[i]['path'] + ' - serverId: ' + loadedSettings[i]['serverId'] + ' - apiKey: ' + loadedSettings[i]['apiKey'] + ' - templateId: ' + loadedSettings[i]['templateId'] + ' - templateName: ' + loadedSettings[i]['templateName']);
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
  nconf.clear(templateSettings.path);

  // set the settings for the current path
  nconf.set(templateSettings.path + ':' + templateSettings.serverId + ':apikey', templateSettings.apiKey);
  nconf.set(templateSettings.path + ':' + templateSettings.serverId + ':template:id', templateSettings.templateId);
  nconf.set(templateSettings.path + ':' + templateSettings.serverId + ':template:name', templateSettings.templateName);

  nconf.save(function (err){
    if (err) {
      console.error(err.message);
      callback(err.message);
      //callback(err.message, 'Error: ' + err.message, 'error');
      return;
    }
    console.log('Configuration saved successfully in ' + currentSettingsFile);
    callback(undefined, currentSettingsFile);
  });
}

exports.file = file;
exports.read = read;
exports.save = save;