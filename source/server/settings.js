var nconf = require('nconf');

var currentSettingsFile;

function file (f){
  nconf.file(f);
  currentSettingsFile = f;
}

function read (callback){
  nconf.load();

  console.log('time: ' + nconf.get('time') + ' from ' + currentSettingsFile);
  callback('time: ' + nconf.get('time') + ' from ' + currentSettingsFile, 'info');
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