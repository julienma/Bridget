/*
NATIVE UI - TRAY, MENU
*/

// require local Watch package (watchr)
var watch = require('./watch.js');

// Load native UI library
var gui = window.require('nw.gui');
// Give it a menu (will be assigned to tray)
var menu = new gui.Menu();
// Get the current window
var win = gui.Window.get(
  window.open('add.html')
);

function addWatchedFolder(loadedSettings, position){

  // add a separator as first item if this is the 1st watched folder
  if (position === 0) {
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
      gui.Shell.showItemInFolder(loadedSettings[position].path);
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
        alert('deleting ' + loadedSettings[position]['templateName']);
      }
    }
  }));
*/
  // get the last folder from the path
  var folder = '/' + loadedSettings[position].path.split('/').splice(-1,1);

  var item = new gui.MenuItem({
    label: folder + ' -> ' + loadedSettings[position].templateName + ' - ' + loadedSettings[position].serverId,
    tooltip: loadedSettings[position].path,
    submenu: submenu
    // TODO: display a color icon for server, instead of incomprehensible letter
  });
  menu.insert(item, position + 2);

  // console.log("Menu - " + 'path: ' + loadedSettings[position]['path'] + ' - serverId: ' + loadedSettings[position]['serverId'] + ' - apiKey: ' + loadedSettings[position]['apiKey'] + ' - templateId: ' + loadedSettings[position]['templateId'] + ' - templateName: ' + loadedSettings[position]['templateName']);
}

function create() {

  // Create a tray icon
  var tray = new gui.Tray({
    //title: 'Bridget',
    icon: 'source/img/tray-icon.png'
  });

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

exports.addWatchedFolder = addWatchedFolder;
exports.create = create;