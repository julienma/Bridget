
/*
NCONF - SAVE CONF
*/

// require local Settings package
var settings = require('./server/settings');

// set the settings file to use
// var settingsPath = process.env['HOME'];
var settingsPath = '/Users/julien/Dropbox/dev/NodeJS/Bridget';
settings.file(settingsPath + '/_bridget_settings.json');


/*
NATIVE UI - TRAY, MENU
*/

  // Load native UI library
  var gui = require('nw.gui');

  // Get the current window
  var win = gui.Window.get();

  win.on('close', function() {
    win.hide(); // Pretend to be closed already
    console.log("We're closing...");
    //this.close(true);
  });

  // Create a tray icon
  var tray = new gui.Tray({
    //title: 'Bridget',
    icon: 'source/img/tray-icon.png'
  });

  // Give it a menu
  var menu = new gui.Menu();
  menu.append(new gui.MenuItem({
    label: 'Watch a folder...',
    click: function(){
      console.log("I'm clicked");
      //win.open('source/list.html');
      win.show();
      win.focus();
    }
  }));
  menu.append(new gui.MenuItem({type:"separator"}));
  menu.append(new gui.MenuItem({
    label: 'Quit',
    click: function(){
      console.log("Bye!");
      win.hide();
      // here, code to unwatch folders
      // TODO

      // Quit current app
      gui.App.quit();
    }
  }));

  tray.menu = menu;

  // Remove the tray
  // tray.remove();
  // tray = null;
