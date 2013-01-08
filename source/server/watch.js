// Require Watchr
var watchr = require('watchr');
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
                console.log('an error occured:', err);
            },
            change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
                console.log('a change event occured - Type: ' + changeType + ' - Path: ' + filePath);
                // do nothing if the changed file is the generated zipfile OR if there's a lock (set by previous upload)
                if ((filePath.indexOf(global.zipfile) !=-1) || template.isLocked()) {
                    console.log('WATCHR: Locked / Ignoring ZIPFILE' + global.zipfile);
                } else {
                    template.upload(filePath, loadedSettings);
                    console.log('WATCHR: Upload template!');
                }
            }
        },
        next: function(err,watchers){
            console.log('watching for all our paths has completed', arguments); // arguments = array with all settings
            watchJob = watchers;
        },
        // TODO: wait for watchr fix? https://github.com/bevry/watchr/issues/28
        ignoreHiddenFiles: true, // ignore files which filename starts with a .
        ignoreCommonPatterns: true, // ignore common undesirable file patterns (e.g. .svn, .git, .DS_Store, thumbs.db, etc)
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