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
function activateTrayIcon (isActive, actionLabel) {
  tray.icon = 'source/img/tray-icon' + ((isActive)?'-active':'') + '.png';

  var currentActionMenu = menu.items[0];
  if(isActive) {
    currentActionMenu.enabled = false;
    currentActionMenu.label = actionLabel;
  } else {
    currentActionMenu.enabled = true;
    currentActionMenu.label = 'Watch a folder...';
  }
}

// reset watchedFolders in tray menu, so we can populate them again after reloading settings
function removeWatchedFolders() {
/*  // DEBUG
  console.log("# TRAY ITEMS: " + menu.items.length);
  for (var key in menu.items) {
      console.log('- ' + key + ' => ' + menu.items[key].label + ' (' + menu.items[key].type + ')');
  }
*/
  // let's remove all items added after initial creation (namely, watched folders). They will keep the same position be in position 1, as removing an item makes the next one moves in its position 1), but the 2 last items (separator + 'quit')
  while(menu.items.length > trayItemsAtCreation) {
    console.log("TRAY: remove item " + menu.items.length + '>' + trayItemsAtCreation);
    menu.removeAt(trayPositionForWatchedFolders);
  }
}

function addWatchedFolder(position){
  // add a separator as first item if this is the 1st watched folder
  if (position === 0) {
    menu.insert(new gui.MenuItem({type:"separator"}), trayPositionForWatchedFolders);
  }

  // Add actions submenu
  var submenu = new gui.Menu();

  // start once the upload script
  submenu.append(new gui.MenuItem({
    label: 'Zip & Upload template',
    click: function() {
      require('./template.js').upload(settings.loadedSettings[position].path, settings.loadedSettings, true, false);
    }
  }));

  submenu.append(new gui.MenuItem({
    label: 'Open folder...',
    click: function() {
      gui.Shell.showItemInFolder(settings.loadedSettings[position].path);
    }
  }));

  // unwatch folder (delete from settings and reload)
  submenu.append(new gui.MenuItem({type:"separator"}));
  submenu.append(new gui.MenuItem({
    label: 'Unwatch',
    click: function() {
      // confirm?
      var doRemove = window.confirm('Are you sure you want to remove this watched folder?\n' + settings.loadedSettings[position].path);
      // if confirmed, clear 'path' key from settings, and reload everything
      if (doRemove){
        settings.clear(settings.loadedSettings[position].path, function (err){
          console.log('UNWATCH OK');
          // reset the watched folders from tray menu, so we can reload them again
          removeWatchedFolders();
          // reload settings.json, populate tray and start watchr. This will include any new watched folder.
          settings.loadAndWatchFolders();
        });
      }
    }
  }));

  // get the last folder from the path.
  // require('path').sep is platform-specific file separator. '\\' or '/'.
  var folder = '/' + settings.loadedSettings[position].path.split(require('path').sep).splice(-1,1);

  var item = new gui.MenuItem({
    label: folder + '  >  ' + settings.loadedSettings[position].templateName,
    tooltip: settings.loadedSettings[position].path,
    icon: 'source/img/server-icon-' + settings.loadedSettings[position].serverId + '.png',
    submenu: submenu
  });
  // add the new tray menu item, after separator (+1)
  menu.insert(item, trayPositionForWatchedFolders + position + 1);

  // console.log("Menu - " + 'path: ' + settings.loadedSettings[position]['path'] + ' - serverId: ' + settings.loadedSettings[position]['serverId'] + ' - apiKey: ' + settings.loadedSettings[position]['apiKey'] + ' - templateId: ' + settings.loadedSettings[position]['templateId'] + ' - templateName: ' + settings.loadedSettings[position]['templateName']);
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
      //win.window.location.href = 'add.html';
      win.reload();
      win.show();
      win.focus();
    }
  }));

  menu.append(new gui.MenuItem({type:"separator"}));

  menu.append(new gui.MenuItem({
    label: 'I have a suggestion / bug...',
    click: function(){
      // Open URL with default browser.
      gui.Shell.openExternal('https://github.com/julienma/Bridget/issues');
    }
  }));

  menu.append(new gui.MenuItem({type:"separator"}));

  menu.append(new gui.MenuItem({
    label: 'Preferences...',
    click: function(){
      var winSettings = gui.Window.open('advanced-settings.html', {
        "title":"Bridget",
        "toolbar": false,
        "width": 600,
        "height": 280,
        "position": "mouse",
        "min_width": 600,
        "min_height": 280,
        "max_width": 600,
        "max_height": 280,
        "always-on-top": true,
        "frame": true
      });
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