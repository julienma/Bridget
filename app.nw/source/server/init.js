/*
INIT
*/

global.currentVersion = "0.9";

// check if an update is available
var version = require('./server/version.js');
// give some time before checking, so everything else is warmed up (watchr, growler)
setTimeout(version.check, 10000);

/*
Global settings
*/

// define filename to which to zip (and to exclude from watchr)
global.zipfile = '_bridget.zip';
// define filetypes to ignore (won't be watched for changes, and won't be zipped)
global.excludeFileExtension = ['zip', 'command'];

/*
Create tray menu
*/

// require local Tray package (node-webkit's tray)
var trayMenu = require('./server/traymenu.js');
// create tray menu
trayMenu.create();

/*
Start watching saved folders
*/

// require local Settings package (nconf)
var settings = require('./server/settings.js');
// set the settings file to use
var settingsPath = process.env.HOME;
settings.file(settingsPath + '/.bridget_settings.json');
// read settings.json, populate tray and start watchr
settings.loadAndWatchFolders();
