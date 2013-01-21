var fs = require('fs'),
    path = require('path');
    rest = require('restler');

global.zipfile = '_bridget.zip';
var templateDir = '/Users/julien/Dropbox/Leadformance/templates/qs-products/';
var templateName = 'Template Roxy (171)';
var uploadUrl = 'https://api.c.leadformance.com/templates/171.json?oauth_token=m1E0Sl7z1XFeH8FuIgQJn5P0OB2eF4NDUjrMK01zdd6JB7Ng';



function uploadWithRequest(templateDir, uploadUrl, templateName) {

  var templateFile = path.join(templateDir, global.zipfile);
  var fileSize;

  fs.stat(templateFile, function(err, stats) {
    if (err) throw err;
    if (stats.isFile()){
      fileSize = stats.size;

      console.log('REQUEST started to ' + uploadUrl);
      console.log('reading from ' + templateFile + ' (' + fileSize + ')');



    rest.put(uploadUrl, {
      multipart: true,
      data: {
        'template': rest.file(templateFile, null, fileSize, null, null) // (path, filename, fileSize, encoding, contentType)
      }
    }).on('complete', function(data) {
      console.log('REQUEST COMPLETE');
      console.log(data);
    });



    }
  });

}

uploadWithRequest(templateDir, uploadUrl, templateName);
