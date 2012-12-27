/*
NCONF - SAVE CONF
*/

// require local Settings package
var settings = require('./server/settings');

// set the settings file to use
// var settingsPath = process.env['HOME'];
var settingsPath = '/Users/julien/Dropbox/dev/NodeJS/Bridget';
settings.file(settingsPath + '/_bridget_settings.json');

