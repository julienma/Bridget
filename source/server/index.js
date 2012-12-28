/**
* Function : dump()
* Arguments: The data - array,hash(associative array),object
*    The level - OPTIONAL
* Returns  : The textual representation of the array.
* This function was inspired by the print_r function of PHP.
* This will accept some data as the argument and return a
* text that will be a more readable version of the
* array/hash/object that is given.
*/
function dump(arr,level) {
  var dumped_text = "";
  if(!level) level = 0;

  //The padding given at the beginning of the line.
  var level_padding = "";
  for(var j=0;j<level+1;j++) level_padding += "    ";

  if(typeof(arr) == 'object') { //Array/Hashes/Objects
   for(var item in arr) {
    var value = arr[item];

    if(typeof(value) == 'object') { //If it is an array,
     dumped_text += level_padding + "'" + item + "' ...\n";
     dumped_text += dump(value,level+1);
   } else {
     dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
   }
 }
  } else { //Stings/Chars/Numbers etc.
   dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
 }
 return dumped_text;
}


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
