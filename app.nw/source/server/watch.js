// Require Watchr
var watchr = require('watchr');
// require local Upload package
var template = require('./template.js');
// require local Notification package
var notification = require('./notification.js');

// make watcher globally available (dirty trick)
var watchJob = {};

function start (pathsToWatch) {
    // Watch a directory or file
    console.log("Start watching for paths: " + pathsToWatch);

    // add exclude files in the option array
    var ignoreOptions = null;
    if (global.excludeFileExtension.length > 0) {
        ignoreOptions = new RegExp('(\\.(' + global.excludeFileExtension.join('|') + '))$','i');
    }
    console.log('WATCHR IGNORE: ' + ignoreOptions);

    watchr.watch({
        paths: pathsToWatch,
        listeners: {
            error: function(err){
                console.log('WATCHR Failed: ', err);
                notification.send('Watch Failure', 'I failed to start watching folders. Please quit and start me again. (' + err + ')', true);
            },
            change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
                console.log('a change event occured - Type: ' + changeType + ' - Path: ' + filePath);
                // do nothing if the changed file is the generated zipfile OR if there's a lock (set by previous upload)
                if ((filePath.indexOf(global.zipfile) !=-1) || template.isLocked()) {
                    console.log('WATCHR: Locked / Ignored file');
                } else {
                    template.upload(filePath, changeType, false, false);
                    console.log('WATCHR: Upload template!');
                }
            }
        },
        next: function(err,watchers){
            console.log('watching for all our paths has completed', arguments); // arguments = array with all settings
            notification.send('Watch Success', 'I\'m now watching your folders. Rock on!');
            watchJob = watchers;
        },
        ignoreHiddenFiles: true, // ignore files which filename starts with a .
        ignoreCommonPatterns: true, // ignore common undesirable file patterns (e.g. .svn, .git, .DS_Store, thumbs.db, etc)
        ignoreCustomPatterns: ignoreOptions, // ignore specific extensions, which are useless to templates and could interfere with normal behavior
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