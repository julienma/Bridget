/*
INIT
*/

global.currentVersion = "1.1";

// check if an update is available
var version = require('./server/version.js');
// give some time before checking, so everything else is warmed up (watchr, growler)
setTimeout(version.check, 10*1000);
// and check every 8hrs
setInterval(version.check, 8*60*60*1000);

/*
Global settings
*/

// define filename to which to zip (and to exclude from watchr)
global.zipfile = '_bridget.zip';
// define filetypes to ignore (won't be watched for changes, and won't be zipped)
global.excludeFileExtension = ['zip', 'command'];

// Get http auth from localStorage
global.authLogin = '';
global.authPassword = '';
if (localStorage.authLogin) {
  global.authLogin = localStorage.authLogin;
}
if (localStorage.authPassword) {
  global.authPassword = localStorage.authPassword;
}
// define default value for timeout
if (!localStorage.authTimeout) {
  localStorage.authTimeout = 2000;
}

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
