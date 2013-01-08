// TODO: add help screen (where and how to reset settings.json), and submit bugs to GH
// TODO: display important messages / errors in alert() instead of message.log(), so it is known to the user
// TODO: replace tray icon, package as standalone, hide dock icon

// require local Settings package (nconf)
var settings = require('./server/settings.js');
// require local Watch package (watchr)
var watch = require('./server/watch.js');

// define filename to which to zip (and to exclude from watchr)
global.zipfile = '_bridget.zip';

/*
INIT
*/

// set the settings file to use
var settingsPath = process.env.HOME;
settings.file(settingsPath + '/.bridget_settings.json');

// Init fn. Will read settings.json, populate tray and start watchr
function init() {
  settings.read(function (err, loadedSettings){
    if (err) {
      console.error(err);
      return;
    }
    // if settings were correctly loaded
    console.log('Configuration loaded successfully: ' + loadedSettings);
    var pathsToWatch = [];
    // create tray menu
    addTrayMenu(loadedSettings);
    // if there's any watched folder loaded from the settings
    if (loadedSettings.length>1) {
      // for each watched folder
      for (var i=0; i<loadedSettings.length-1; i++) {
        // add one tray menu entry
        addTrayMenuForWatchedFolders(loadedSettings, i);
        // get every paths loaded
        pathsToWatch.push(loadedSettings[i]['path']);
      }
    }
    // and watch them
    watch.start(pathsToWatch, loadedSettings, apiServer);

  });
}


/*
NATIVE UI - TRAY, MENU
*/

  // Load native UI library
  var gui = require('nw.gui');
  // Get the current window
  var win = gui.Window.get(
    window.open('add.html')
  );

  // Create a tray icon
  var tray = new gui.Tray({
    //title: 'Bridget',
    icon: 'source/img/tray-icon.png'
  });
  // Give it a menu
  var menu = new gui.Menu();

  function addTrayMenuForWatchedFolders(loadedSettings, i){

    // add a separator as first item if this is the 1st watched folder
    if (i===0) {
      menu.insert(new gui.MenuItem({type:"separator"}), 1);
    }

    // Add actions submenu
    var submenu = new gui.Menu();

    // TODO later
/*    submenu.append(new gui.MenuItem({
      label: 'Force upload to server',
      click: function() {
        // TODO: start once the upload script
        console.log(this.label);

        // TEST DEBUG
        win.window.location.href = 'test-nodejs.html';
        win.show();
        win.focus();
      }
    }));
*/
    submenu.append(new gui.MenuItem({
      label: 'Open in Finder...',
      click: function() {
        gui.Shell.showItemInFolder(loadedSettings[i]['path']);
      }
    }));

    // TODO later
/*    submenu.append(new gui.MenuItem({type:"separator"}));
    submenu.append(new gui.MenuItem({
      label: 'Unwatch & Delete',
      click: function() {
        // TODO: remove from watchr and delete from nconf
        console.log(this.label);
        var doDelete = confirm('Do you want to delete this watched folder?');
        // if confirmed
        if (doDelete){
          alert('deleting ' + loadedSettings[i]['templateName']);
        }
      }
    }));
*/
    // get the last folder from the path
    var folder = '/' + loadedSettings[i]['path'].split('/').splice(-1,1);

    var item = new gui.MenuItem({
      label: folder + ' -> ' + loadedSettings[i]['templateName'] + ' - ' + loadedSettings[i]['serverId'],
      tooltip: loadedSettings[i]['path'],
      submenu: submenu
    });
    menu.insert(item, i + 2);

    // console.log("Menu - " + 'path: ' + loadedSettings[i]['path'] + ' - serverId: ' + loadedSettings[i]['serverId'] + ' - apiKey: ' + loadedSettings[i]['apiKey'] + ' - templateId: ' + loadedSettings[i]['templateId'] + ' - templateName: ' + loadedSettings[i]['templateName']);
  }

  function addTrayMenu(loadedSettings) {

    // catch window's closing, so we can actually keep the app running in the tray
    win.on('close', function() {
      win.hide(); // Pretend to be closed already
      console.log("We're closing...");
      //this.close(true);
    });

    // add tray menu
    tray.menu = menu;
    menu.append(new gui.MenuItem({
      label: 'Watch a folder...',
      click: function(){
        console.log("I'm clicked");
        // open a new window with the "Watch new folder" page.
        win.window.location.href = 'add.html';
        win.show();
        win.focus();
      }
    }));

    // add quit button
    menu.append(new gui.MenuItem({type:"separator"}));
    menu.append(new gui.MenuItem({
      label: 'Quit',
      click: function(){
        console.log("Bye!");

        // hide window and remove tray, so we fake a fast exit
        win.hide();
        tray.remove();
        tray = null;

        // here, code to unwatch folders
        watch.stop();

        // Quit current app
        gui.App.quit();
      }
    }));

  }