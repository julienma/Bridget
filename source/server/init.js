
// require local Settings package (nconf)
var settings = require('./server/settings.js');
// require local Watch package (watchr)
var watch = require('./server/watch.js');

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
    // Add actions submenu
    var submenu = new gui.Menu();
    submenu.append(new gui.MenuItem({
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
    submenu.append(new gui.MenuItem({
      label: 'Open in Finder...',
      click: function() {
        gui.Shell.showItemInFolder(loadedSettings[i]['path']);
      }
    }));
    submenu.append(new gui.MenuItem({type:"separator"}));
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

    // get the last folder from the path
    var folder = '/' + loadedSettings[i]['path'].split('/').splice(-1,1);

    var item = new gui.MenuItem({
      label: folder + ' -> ' + loadedSettings[i]['templateName'] + ' - ' + loadedSettings[i]['serverId'],
      tooltip: loadedSettings[i]['path'],
      submenu: submenu
    });
    menu.append(item);

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

    // add one entry for each watched folder, if there's any
    if (loadedSettings.length>0) {
      menu.append(new gui.MenuItem({type:"separator"}));

      for (var i=0; i<loadedSettings.length-1; i++) {
        addTrayMenuForWatchedFolders(loadedSettings, i);
      }
    }

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