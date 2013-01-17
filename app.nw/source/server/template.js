var spawn = require('child_process').spawn;

// require common serverlist (both server & browser)
var serverlist = require('../client/serverlist.js');
// require local Tray package (node-webkit's tray)
var trayMenu = require('./traymenu.js');
// require local Notification package
var notification = require('./notification.js');

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
    notification.send('Upload Success', 'Upload successful on ' + templateName + '! (Source: ' + templateDir + ')');
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
      // wait a bit that user's done all the filesystem operations before continuing
      setTimeout(function() {
        zipAndUpload(templateDir, uploadUrl, templateName);
      }, 100);
      // make sure to upload only on the 1st found occurence
      break;
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
          notification.send('Upload Failure', 'ZIP creation failed! (' + code + ')', true);
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
      // console.log(data);
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
        notification.send('Upload Failure', 'UPLOAD failed (could be 401, 301, etc.)', true);
      }

  });
  // spawned child_process exits
  curl.on('exit', function(code) {
      if (code !== 0) {
          console.log('CURL Failed: ' + code);
          notification.send('Upload Failure', 'CURL process failed! (' + code + ')', true);
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