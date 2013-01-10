var spawn = require('child_process').spawn;

// require common serverlist (both server & browser)
var serverlist = require('../client/serverlist.js');
// require local Tray package (node-webkit's tray)
var trayMenu = require('./traymenu.js');

// a lock is used to create an interval between multiple file changes / uploads
var locked = 0;

// lock after upload, so no more than 1 upload at a time is done
function lock() {
  console.log('LOCKED');
  locked = 1;
  trayMenu.activateTrayIcon(true);
}

// unlock after curl is finished
function unlock() {
  console.log('UNLOCKED');
  locked = 0;
  trayMenu.activateTrayIcon(false);
}

function isLocked () {
  console.log('IS LOCKED? ' + locked);
  return locked;
}

function upload (filePath, loadedSettings) {
  // set a lock so we avoid uploading more than once
  lock();

  console.log("TEMPLATE: " + filePath);

  // try to find the template directory within the filePath of changed file
  for (var i=0; i<loadedSettings.length-1; i++) {
    if (filePath.indexOf(loadedSettings[i]['path']) !=-1) {
      var templateDir = loadedSettings[i]['path'];
      // construct the "template upload" API Url
      var uploadUrl = serverlist.getServerDetails(loadedSettings[i]['serverId'], serverlist.apiServer).url + '/templates/' + loadedSettings[i]['templateId'] + '.json?oauth_token=' + loadedSettings[i]['apiKey'];
      console.log('FOUND path for template ' + loadedSettings[i]['templateName'] + ': ' + uploadUrl);
      // and upload
      zipAndUpload(templateDir, uploadUrl);
    }
  }
}

function zipAndUpload(templateDir, uploadUrl) {
    // Options -r recursive
    var zip = spawn('zip', ['-r', global.zipfile, '.'], {
        cwd: templateDir,
        env: process.env
    });

    zip.stderr.on('data', function (data) {
        // see the files being added
        console.log('zip stderr: ' + data);
    });

    // End the response on zip exit
    zip.on('exit', function(code) {
        if(code !== 0) {
            console.log('ZIP Failed: ' + code);
            alert('ZIP Failed: ' + code);
        } else {
            console.log('ZIP OK');
            // start upload
            uploadWithCurl(templateDir, uploadUrl);
        }
    });

}

function uploadWithCurl(templateDir, uploadUrl) {
    // execute curl using child_process' spawn function
    var curl = spawn('curl', ['-i', '-F', 'template=@' + zipfile, '-F', '_method=PUT', uploadUrl], {
        cwd: templateDir,
        env: process.env
    });
    curl.stdout.setEncoding('utf8');
    // display the curl output with a 'data' event listener
    var log = '';
    curl.stdout.on('data', function(data) {
        console.log(data);
        log += data;
    });
    // 'end' event listener
    curl.stdout.on('end', function(data) {
        var successString = 'HTTP/1.1 200 OK';
        // try to find the success string (otherwise it could be a 401, 301, etc.)
        if (log.lastIndexOf(successString) !=-1) {
            console.log('UPLOAD DONE');
        } else {
          console.log('UPLOAD Failed (could be 401, 301, etc.)');
          alert('UPLOAD Failed (could be 401, 301, etc.)');
        }

    });
    // spawned child_process exits
    curl.on('exit', function(code) {
        if (code !== 0) {
            console.log('CURL Failed: ' + code);
            alert('CURL Failed: ' + code);
        } else console.log('CURL OK');
        // remove lock so we can upload once again
        unlock();

    });
}

exports.upload = upload;
exports.isLocked = isLocked;