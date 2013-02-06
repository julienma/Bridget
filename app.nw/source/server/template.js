var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var dive = require('dive');
var zip = require('node-native-zip');
var rest = require('restler');

// require common serverlist (both server & browser)
var serverlist = require('../client/serverlist.js');
// require local Tray package (node-webkit's tray)
var trayMenu = require('./traymenu.js');
// require local Notification package
var notification = require('./notification.js');
// require local Settings package (nconf)
var settings = require('./settings.js');

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

function upload (filePath) {
  // set a lock so we avoid uploading more than once
  lock();

  console.log("TEMPLATE: " + filePath);

  // try to find the template directory within the filePath of changed file
  for (var i=0; i<settings.loadedSettings.length-1; i++) {
    if (filePath.indexOf(settings.loadedSettings[i]['path']) !=-1) {
      var templateDir = settings.loadedSettings[i]['path'];
      var templateName = settings.loadedSettings[i]['templateName'];
      // construct the "template upload" API Url
      var uploadUrl = serverlist.getServerDetails(settings.loadedSettings[i].serverId, serverlist.apiServer).url + '/templates/' + settings.loadedSettings[i].templateId + '.json?oauth_token=' + settings.loadedSettings[i].apiKey;
      console.log('FOUND path for template ' + settings.loadedSettings[i].templateName + ': ' + uploadUrl);
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
  var archive = new zip();
  var zipFiles = [];

  // recursively dive through every directory of the path
  dive(templateDir, function(err, file) {
    if (err) {
      console.log('DIVE Failed: ' + err);
      notification.send('Upload Failure', 'ZIP creation failed! (dive: ' + err + ')', true);
    } else {
      var isExcluded = false;
      // check if file should be excluded from zip, based on exclude list
      for (var i=0; i<global.excludeFileExtension.length; i++) {
        // get file extension
        if (file.split('.').splice(-1,1) == global.excludeFileExtension[i]) {
          isExcluded = true;
          console.log('ZIP excluded file: ' + file);
        }
      }
      // if file is not excluded
      if(!isExcluded){
        // then add it to the list of files to be zipped
        zipFiles.push({
          // clean the path inside the zip, so it's relative to the root of the templateDir -- don't forget trailing slash (path.sep is platform-specific file separator. '\\' or '/'.)
          name: file.replace(templateDir + path.sep, ''),
          path: file
        });
      }
    }
  }, function() {
    for (var key in zipFiles){
      console.log('ZIP - ' + key + ' = ' + zipFiles[key].name + ' - ' + zipFiles[key].path);
    }
    // actually zip the files
    archive.addFiles(zipFiles, function (err) {
      if (err) {
        console.log('ZIP Failed: ' + code);
        notification.send('Upload Failure', 'ZIP creation failed! (addFiles: ' + err + ')', true);
      } else {
        // and write it in template directory
        fs.writeFile(path.join(templateDir, global.zipfile), archive.toBuffer(), function (err) {
          if (err) {
            console.log('ZIP Failed: ' + code);
            notification.send('Upload Failure', 'ZIP creation failed! (writeFile: ' + err + ')', true);
          } else {
            console.log('ZIP OK');
            // start upload
            uploadWithRequest(templateDir, uploadUrl, templateName);
          }
        });
      }
    });
    console.log('DIVE complete');
  });

}

function uploadWithRequest(templateDir, uploadUrl, templateName) {
  var templateFile = path.join(templateDir, global.zipfile);
  var fileSize;

  // get file size of attached zip (necessary for multipart upload)
  fs.stat(templateFile, function(err, stats) {
    if (err) {
      notification.send('Upload Failure', 'Can\'t read zip! (' + err + ')', true);
    } else if (stats.isFile()){
      fileSize = stats.size;
      console.log('UPLOADING ' + templateFile + ' (' + fileSize + ')');

      // PUT HTTP request to /templates/:id.json
      rest.put(uploadUrl, {
        multipart: true,
        data: {
          // rest.file(path, filename, fileSize, encoding, contentType)
          'template': rest.file(templateFile, null, fileSize, null, null)
        }
      }).on('complete', function(data, response) {
        // console.log(data);
        if (response.statusCode == 200) {
          console.log('UPLOAD DONE');
          notification.send('Upload Success', 'Upload successful on ' + templateName + '! (Source: ' + templateDir + ')');
        } else {
          console.log('UPLOAD Failed (statuscode: ' + response.statusCode + ')');
          notification.send('Upload Failure', 'UPLOAD failed! (statuscode: ' + response.statusCode + ')', true);
        }
        // remove lock so we can upload once again
        unlock();
      });
    }
  });

}

exports.upload = upload;
exports.isLocked = isLocked;