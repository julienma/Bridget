// Require Watchr
var watchr = require('watchr');
var growl = require('growl');
// require local Upload package
var template = require('./template.js');

// make watcher globally available (dirty trick)
var watchJob = {};

function start (pathsToWatch, loadedSettings) {
    // Watch a directory or file
    console.log("Start watching for paths: " + pathsToWatch);
    watchr.watch({
        paths: pathsToWatch,
        listeners: {
            error: function(err){
                console.log('WATCHR Failed: ', err);
                growl('I failed to start watching folders. Please quit and start me again. (' + err + ')', { title: 'Bridget', image: 'source/img/tray-icon-active.png' });
            },
            change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
                console.log('a change event occured - Type: ' + changeType + ' - Path: ' + filePath);
                // do nothing if the changed file is the generated zipfile OR if there's a lock (set by previous upload)
                if ((filePath.indexOf(global.zipfile) !=-1) || template.isLocked() || (filePath.split('.').pop() == 'zip')) {
                    console.log('WATCHR: Locked / Ignored file');
                } else {
                    template.upload(filePath, loadedSettings);
                    console.log('WATCHR: Upload template!');
                }
            }
        },
        next: function(err,watchers){
            console.log('watching for all our paths has completed', arguments); // arguments = array with all settings
            growl('I\'m now watching your folders. Rock on!', { title: 'Bridget', image: 'source/img/tray-icon.png' });
            watchJob = watchers;
        },
        ignoreHiddenFiles: true, // ignore files which filename starts with a .
        ignoreCommonPatterns: true, // ignore common undesirable file patterns (e.g. .svn, .git, .DS_Store, thumbs.db, etc)

        // commenting this while waiting for https://github.com/bevry/watchr/issues/29
        // once fixed, rewind l.23 (filePath.split('.').pop() == 'zip') and uncomment here
        // ignoreCustomPatterns: /^(\.(command|zip))$/i, // ignore specific extensions, which are useless to templates and could interfere with normal behavior

        persistent: true
    });
}

function stop () {
    var i;
    for ( i=0; i<watchJob.length; i++ ) {
        console.log('Stop watching ' + watchJob[i].path);
        watchJob[i].close();
    }
}

exports.start = start;
exports.stop = stop;