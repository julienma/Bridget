/*
NATIVE UI - TRAY, MENU
*/

// require local Watch package (watchr)
var watch = require('./watch.js');
// require local Settings package (nconf)
var settings = require('./settings.js');

// Load native UI library
var gui = window.require('nw.gui');
// Give it a menu (will be assigned to tray)
var menu = new gui.Menu();
// Get the current window
var win = gui.Window.get(
  window.open('add.html')
);
// will be the tray object
var tray;
// Hold the number of tray menu items after initial creation, so we can use it to remove additional watched folder items
var trayItemsAtCreation;
// position in the tray menu at which to insert new items for watched folders (here, after the 1st item 'watch a folder')
var trayPositionForWatchedFolders = 1;

// switch tray icon depending on bool isActive
function activateTrayIcon (isActive) {
  tray.icon = 'source/img/tray-icon' + ((isActive)?'-active':'') + '.png';
}

// reset watchedFolders in tray menu, so we can populate them again after reloading settings
function removeWatchedFolders() {
  // DEBUG
  console.log("# TRAY ITEMS: " + menu.items.length);
  for (var key in menu.items) {
      console.log('- ' + key + ' => ' + menu.items[key].label + ' (' + menu.items[key].type + ')');
  }

  // let's remove all items added after initial creation (namely, watched folders). They will keep the same position be in position 1, as removing an item makes the next one moves in its position 1), but the 2 last items (separator + 'quit')
  while(menu.items.length > trayItemsAtCreation) {
    console.log("TRAY: remove item " + menu.items.length + '>' + trayItemsAtCreation);
    menu.removeAt(trayPositionForWatchedFolders);
  }
}

function addWatchedFolder(loadedSettings, position){
  // add a separator as first item if this is the 1st watched folder
  if (position === 0) {
    menu.insert(new gui.MenuItem({type:"separator"}), trayPositionForWatchedFolders);
  }

  // Add actions submenu
  var submenu = new gui.Menu();

  submenu.append(new gui.MenuItem({
    label: 'Open in Finder...',
    click: function() {
      gui.Shell.showItemInFolder(loadedSettings[position].path);
    }
  }));

  // start once the upload script
  submenu.append(new gui.MenuItem({
    label: 'Force upload to server',
    click: function() {
      require('./template.js').upload(loadedSettings[position].path, loadedSettings);
    }
  }));

  // unwatch folder (delete from settings and reload)
  submenu.append(new gui.MenuItem({type:"separator"}));
  submenu.append(new gui.MenuItem({
    label: 'Unwatch & Remove',
    click: function() {
      // confirm?
      var doRemove = window.confirm('Are your sure you want to remove this watched folder?\n' + loadedSettings[position].path);
      // if confirmed, clear 'path' key from settings, and reload everything
      if (doRemove){
        settings.clear(loadedSettings[position].path, function (err){
          console.log('UNWATCH OK');
          // reset the watched folders from tray menu, so we can reload them again
          removeWatchedFolders();
          // reload settings.json, populate tray and start watchr. This will include any new watched folder.
          settings.loadAndWatchFolders();
        });
      }
    }
  }));

  // get the last folder from the path
  var folder = '/' + loadedSettings[position].path.split('/').splice(-1,1);

  var item = new gui.MenuItem({
    label: folder + '  >  ' + loadedSettings[position].templateName,
    tooltip: loadedSettings[position].path,
    icon: 'source/img/server-icon-' + loadedSettings[position].serverId + '.png',
    submenu: submenu
  });
  // add the new tray menu item, after separator (+1)
  menu.insert(item, trayPositionForWatchedFolders + position + 1);

  // console.log("Menu - " + 'path: ' + loadedSettings[position]['path'] + ' - serverId: ' + loadedSettings[position]['serverId'] + ' - apiKey: ' + loadedSettings[position]['apiKey'] + ' - templateId: ' + loadedSettings[position]['templateId'] + ' - templateName: ' + loadedSettings[position]['templateName']);
}

function create() {
  // Create a tray icon - 18x18 px PNG w/ alpha
  tray = new gui.Tray({
    //title: 'Bridget',
    icon: 'source/img/tray-icon.png'
    // tray icon source: Daniel Bruce (www.entypo.com)
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
      // open a new window with the "Watch new folder" page.
      win.window.location.href = 'add.html';
      win.show();
      win.focus();
    }
  }));

  // add quit button
  menu.append(new gui.MenuItem({type:"separator"}));
  menu.append(new gui.MenuItem({
    label: 'Submit a bug...',
    click: function(){
      // Open URL with default browser.
      gui.Shell.openExternal('https://github.com/julienma/Bridget/issues');
    }
  }));

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

// number of items in tray initial state
trayItemsAtCreation = menu.items.length;

}

exports.activateTrayIcon = activateTrayIcon;
exports.addWatchedFolder = addWatchedFolder;
exports.removeWatchedFolders = removeWatchedFolders;
exports.create = create;