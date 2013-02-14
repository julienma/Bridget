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
// require local snippet package
var snippet = require ('./snippet.js');

// timeout (ms) to wait before doing the Zip & Upload
// it gives some time to the filesystem operations to finish before continuing
var timeoutBeforeZip = 200;
// a lock is used to create an interval between multiple file changes / uploads
var locked = 0;

// lock after upload, so no more than 1 upload at a time is done
function lock(doForce) {
  console.log('LOCKED');
  // disable further upload only if we doForce
  if (doForce) locked = 1;
  trayMenu.activateTrayIcon(true);
}

// unlock after curl is finished
function unlock(doForce) {
  console.log('UNLOCKED');
  // re-enable upload only if we doForce (to avoid unlocking by snippet uploads)
  if (doForce) locked = 0;
  // disable the tray icon only after a minimum time, so it can be visible for very fast operations
  setTimeout(function() {
    trayMenu.activateTrayIcon(false);
  }, 500);
}

function isLocked () {
  console.log('IS LOCKED? ' + locked);
  return locked;
}

function upload (filePath, changeType, forceZipUpload) {
  // set a non-blocking lock > will flash the tray icon to say there is work ongoing
  lock();

  console.log("UPLOAD: " + filePath);

  // try to find the template directory within the filePath of changed file
  for (var i=0; i<settings.loadedSettings.length-1; i++) {
    if (filePath.indexOf(settings.loadedSettings[i].path) !=-1) {
      var templateDir = settings.loadedSettings[i].path;
      var templateName = settings.loadedSettings[i].templateName;

      var serverId = settings.loadedSettings[i].serverId;
      var templateId = settings.loadedSettings[i].templateId;
      var apiKey = settings.loadedSettings[i].apiKey;

      // construct the "zipped template upload" API Url
      var uploadUrl = serverlist.getServerDetails(serverId, serverlist.apiServer).url + '/templates/' + templateId + '.json?oauth_token=' + apiKey;
      console.log('FOUND path for template ' + templateName + ': ' + uploadUrl);

      // check if extension is .html (only .html snippets should be uploaded) and if we do not forceZipUpload
      if ((path.extname(filePath) == '.html') && (!forceZipUpload)){
          console.log("SNIPPET UPLOAD");
          // get snippetID: excludes the templateDir and the file extension (the full snippet name includes the path after templateDir)
          var snippetName = filePath.replace(templateDir + path.sep, '').replace(/(?:\.([^.]+))?$/, '');

          snippet.getId(templateId, snippetName, function(err, snippetId) {
            // we don't have a list of snippet of that template
            if(err) {
              console.log('SNIPPET: no snippet list for template ' + templateId);
              // force upload with standard zip&upload
              upload(filePath, changeType, true);
              // and exit current upload
              return;
            }else{
              // if the snippet has been deleted
              if (changeType == 'delete') {
                // we found the id of the snippet, so we delete
                if (snippetId) {
                  console.log('Delete SNIPPET id: ' + snippetId + ' - ' + snippetName);
                  snippet.del(i, snippetId, function (err, res) {
                    if (err) {
                      console.log('SNIPPET delete error: ' + res);
                      // force upload with standard zip&upload
                      upload(filePath, changeType, true);
                      // and exit current upload
                      return;
                    } else {
                      console.log('Snippet deleted');
                      // once deleted, update the list of all snippet IDs of that template
                      snippet.getAllIds(i, function(err, res){
                        if(err) {
                          console.log('Error getting snippets');
                        } else {
                          console.log('Retrieved ' + res + ' snippets');
                        }
                      });
                      // we're done
                      unlock();
                    }
                  });
                // if we don't have a snippetId, it's only a local delete, and there is nothing to do on the server, so we're done
                } else {
                  console.log('Nothing to delete on server');
                  unlock();
                }
              // otherwise, try to update / create the snippet
              } else {
                // we found the id of the snippet, so we update
                if (snippetId) {
                  console.log('Update SNIPPET id: ' + snippetId + ' for snippet ' + snippetName);
                  snippet.update(i, snippetId, filePath, function (err, res) {
                    if (err) {
                      console.log('SNIPPET update error: ' + res);
                      // force upload with standard zip&upload
                      upload(filePath, changeType, true);
                      // and exit current upload
                      return;
                    } else {
                      console.log('Snippet updated');
                      // we're done
                      unlock();
                    }
                  });
                // no id, so we create a new snippet
                } else {
                  console.log('Creating new SNIPPET for ' + snippetName);
                  snippet.create(i, snippetName, filePath, function (err, res) {
                    if (err) {
                      console.log('SNIPPET create error: ' + res);
                      // force upload with standard zip&upload
                      upload(filePath, changeType, true);
                      // and exit current upload
                      return;
                    } else {
                      console.log('New snippet created for ' + snippetName + ', ID: ' + res);
                      // once created, update the list of all snippet IDs of that template
                      snippet.getAllIds(i, function(err, res){
                        if(err) {
                          console.log('Error getting snippets');
                        } else {
                          console.log('Retrieved ' + res + ' snippets');
                        }
                      });
                      // we're done
                      unlock();
                    }
                  });
                }
              }
            }

          });

        // if we can not upload a snippet (could also be a css or picture), fallback to zip and upload everything
        } else {
          // set a blocking lock so we avoid uploading more than once
          lock(true);

          setTimeout(function() {
            zipAndUpload(templateDir, uploadUrl, templateName, function () {
                // once uploaded, get a list of all snippet IDs of that template
                snippet.getAllIds(i, function(err, res){
                  if(err) {
                    console.log('Error getting snippets');
                  } else {
                    console.log('Retrieved ' + res + ' snippets');
                  }
                });
                // and unlock to allow future uploads
                unlock(true);
            });
          }, timeoutBeforeZip);
        }
      // make sure to upload only on the 1st found occurence
      break;
    }
  }
}

function zipAndUpload(templateDir, uploadUrl, templateName, callback) {
  console.log("ZIP AND UPLOAD!");

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
/*  // DEBUG
    for (var key in zipFiles){
      console.log('ZIP - ' + key + ' = ' + zipFiles[key].name + ' - ' + zipFiles[key].path);
    }
*/
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
            uploadWithRequest(templateDir, uploadUrl, templateName, callback);
          }
        });
      }
    });
    console.log('DIVE complete');
  });

}

function uploadWithRequest(templateDir, uploadUrl, templateName, callback) {
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
        callback();
      });
    }
  });

}

exports.upload = upload;
exports.isLocked = isLocked;