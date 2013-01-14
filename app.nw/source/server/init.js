/*
INIT
*/

/*
Global settings
*/

// define filename to which to zip (and to exclude from watchr)
global.zipfile = '_bridget.zip';
// define filetypes to ignore (won't be watched for changes, and won't be zipped)
global.excludeFileExtension = ['zip', 'command', 'html'];

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
