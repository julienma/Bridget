/*
INIT
*/

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
// set the path of the settings file
// $HOME might not be set on Windows, so we use $USERPROFILE
var settingsPath = (process.env.HOME || process.env.USERPROFILE);
// make sure the path is normalized, so it works on windows ('/' vs '\\')
settings.file(require('path').join(settingsPath, '.bridget_settings.json'));
// read settings.json, populate tray and start watchr
settings.loadAndWatchFolders();
