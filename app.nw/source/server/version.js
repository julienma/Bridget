var rest = require('restler');
// Load native UI library
var gui = window.require('nw.gui');

function check() {
  rest.get('https://raw.github.com/julienma/Bridget/master/app.nw/version.json', {parser: rest.parsers.json}).on('complete', function(res) {
    if (res instanceof Error) {
        console.log('Error checking version update: ' + res.message);
      } else {
        if (global.currentVersion != res.version) {
          console.log('NEW VERSION available: ' + res.version);
          if(window.confirm('A new version of Bridget is available: ' + res.version + '\n"' + res.message + '"\n\nClick OK to update from version ' + global.currentVersion + ' to ' + res.version + '.\n(Tip: you should do it!)')) {
            gui.Shell.openExternal(res.updateUrl);
          }
        } else console.log('VERSION up-to-date: ' + res.version);
      }
  });
}

exports.check = check;
