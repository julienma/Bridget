// Require
watchr = require('watchr');

// Watch a directory or file
watchr.watch({
    paths: ['.'],
    listeners: {
        error: function(err){
            console.log('an error occured:', err);
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
            console.log('a change event occured - Type: ' + changeType + ' - Path: ' + filePath);
        }
    },
    next: function(err,watchers){
        console.log('watching for all our paths has completed', arguments); // arguments = array with all settings
    },
    ignoreHiddenFiles: true, // ignore files which filename starts with a .
    ignoreCommonPatterns: true, // ignore common undesirable file patterns (e.g. .svn, .git, .DS_Store, thumbs.db, etc)
    persistent: true
});