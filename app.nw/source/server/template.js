var spawn = require('child_process').spawn;
var growl = require('growl');

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

// display an "upload success" message only if both curl exit/end events are OK
var isCurlEndSuccessful, isCurlExitSuccessful;
function isUploadSuccessful(e, isSuccess, templateDir, templateName) {
  switch(e) {
    case 'end':
      isCurlEndSuccessful = (isSuccess)?true:false;
      break;
    case 'exit':
      isCurlExitSuccessful = (isSuccess)?true:false;
      break;
  }
  console.log('SUCCESS? - End: ' + isCurlEndSuccessful + ' - Exit: ' + isCurlExitSuccessful);

  if(isCurlEndSuccessful && isCurlExitSuccessful) {
    growl('Upload successfull on ' + templateName + '! (Source: ' + templateDir + ')', { title: 'Bridget', image: 'source/img/tray-icon.png' });
  }
}

function upload (filePath, loadedSettings) {
  // set a lock so we avoid uploading more than once
  lock();

  console.log("TEMPLATE: " + filePath);

  // try to find the template directory within the filePath of changed file
  for (var i=0; i<loadedSettings.length-1; i++) {
    if (filePath.indexOf(loadedSettings[i]['path']) !=-1) {
      var templateDir = loadedSettings[i]['path'];
      var templateName = loadedSettings[i]['templateName'];
      // construct the "template upload" API Url
      var uploadUrl = serverlist.getServerDetails(loadedSettings[i]['serverId'], serverlist.apiServer).url + '/templates/' + loadedSettings[i]['templateId'] + '.json?oauth_token=' + loadedSettings[i]['apiKey'];
      console.log('FOUND path for template ' + loadedSettings[i]['templateName'] + ': ' + uploadUrl);
      // and upload
      zipAndUpload(templateDir, uploadUrl, templateName);
    }
  }
}

function zipAndUpload(templateDir, uploadUrl, templateName) {
    // Options -r recursive
    var zipOptions = ['-r', '-X', global.zipfile, '.', '-x'];
    // add exclude files in the option array
    for (var i=0; i<global.excludeFileExtension.length; i++) {
      zipOptions.push('*.' + global.excludeFileExtension[i]);
    }

    var zip = spawn('zip', zipOptions, {
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
            growl('ZIP creation failed! (' + code + ')', { title: 'Bridget', image: 'source/img/tray-icon-active.png' });
        } else {
            console.log('ZIP OK');
            // start upload
            uploadWithCurl(templateDir, uploadUrl, templateName);
        }
    });

}

function uploadWithCurl(templateDir, uploadUrl, templateName) {
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
            isUploadSuccessful('end', true, templateDir, templateName);
        } else {
          console.log('UPLOAD Failed (could be 401, 301, etc.)');
          growl('UPLOAD failed (could be 401, 301, etc.)', { title: 'Bridget', image: 'source/img/tray-icon-active.png' });
        }

    });
    // spawned child_process exits
    curl.on('exit', function(code) {
        if (code !== 0) {
            console.log('CURL Failed: ' + code);
            growl('CURL process failed! (' + code + ')', { title: 'Bridget', image: 'source/img/tray-icon-active.png' });
        } else {
          console.log('CURL OK');
          isUploadSuccessful('exit', true, templateDir, templateName);
        }
        // remove lock so we can upload once again
        unlock();

    });
}

exports.upload = upload;
exports.isLocked = isLocked;