// Require
var watchr = require('watchr');

// make watcher globally available (dirty trick)
var watchJob;

function start (pathsToWatch) {
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
                // TODO: upload changes
            }
        },
        next: function(err,watchers){
            console.log('watching for all our paths has completed', arguments); // arguments = array with all settings
            for ( i=0; i<watchers.length; i++ ) {
                //watchers[i].close();
                console.log("WATCHER: " + watchers[i].path);
            }
            watchJob = watchers;
        },
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