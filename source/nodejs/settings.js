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

function save (callback){
  nconf.set('time', process.hrtime()[0]);

/*
  nconf.set('id', 0);
  nconf.set('apikey', 'azertyuiopmlkjhgfdsq');
  nconf.set('server:url', 'https://api-c.leadformance.com');
  nconf.set('server:name', 'Client QA (.c)');
  nconf.set('template:id', '152');
  nconf.set('template:name', 'Template 1');
  nconf.set('time', process.hrtime()[0]);
*/

  nconf.save(function (err){
    if (err) {
      console.error(err.message);
      callback('Error: ' + err.message, 'error');
      return;
    }
    console.log('Configuration saved successfully in ' + currentSettingsFile);
    callback('Configuration saved successfully in ' + currentSettingsFile, 'success');
  });
}

exports.file = file;
exports.read = read;
exports.save = save;