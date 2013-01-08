/*
INIT
*/

// TODO: add help screen (where and how to reset settings.json), and submit bugs to GH
// TODO: display important messages / errors in alert() instead of message.log(), so it is known to the user
// TODO: replace tray icon, package as standalone, hide dock icon

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

/*
Global settings
*/

// define filename to which to zip (and to exclude from watchr)
global.zipfile = '_bridget.zip';
