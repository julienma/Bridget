var fs = require('fs'),
    request = require('request'),
    path = require('path');

global.zipfile = '_bridget.zip';
var templateDir = '/Users/julien/Dropbox/Leadformance/templates/qs-products/';
var templateName = 'Template Roxy (171)';
var uploadUrl = 'https://api-c.leadformance.com/templates/171.json?oauth_token=m1E0Sl7z1XFeH8FuIgQJn5P0OB2eF4NDUjrMK01zdd6JB7Ng';



function uploadWithRequest(templateDir, uploadUrl, templateName) {

  var templateFile = path.join(templateDir, global.zipfile);

  console.log('REQUEST started to ' + uploadUrl);
  console.log('reading from ' + templateFile);

  fs.stat(templateFile, function(err, stats) {
    if (err) throw err;
    if (stats.isFile()){
      fileSize = stats.size;


/*      var file = fs.createReadStream(templateFile)
        .pipe(request.put({
          url: uploadUrl,
          headers: {'Content-Length': fileSize}
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
            console.log('REQUEST done!');
          } else {
            console.log(body);
            console.log('REQUEST error: '+ response.statusCode);
          }
        }));
*/



fs.readFile(templateFile, function(err, data) {
  if (err) throw err; // Fail if the file can't be read.
    console.log('REQUEST starting...');
    request.put({
      url: uploadUrl,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Content-Length': fileSize
        // Content-Type: multipart/form-data; boundary=----------------------------7c66959c63b6
        // Content-Type: multipart/form-data; boundary=----------------------------053405abbf35
      },
      form: {
        'template': data,
        '_method': 'PUT'
      }
    },
    function (error, response, body) {
      if(error) {
        console.log('REQUEST error: ' + error);
      } else {
        console.log(body);
        console.log('REQUEST status: ' + response.statusCode);
        if(response.statusCode === 200) {
          console.log('REQUEST done!');
        }
      }
    });

});


/*  request.put({
    url: uploadUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Content-Length': fileSize,
      'Keep-Alive': 115,
      'Connection': 'keep-alive'
    },
    form: {
      'template': fs.createReadStream(templateFile),
      '_method': 'PUT'
    }
  }, function (error, response, body) {
    if(error) {
      console.log('REQUEST error: ' + error);
    } else {
      console.log(body);
      console.log('REQUEST status: ' + response.statusCode);
      if(response.statusCode === 200) {
        console.log('REQUEST done!');
      }
    }

  });
*/



    }
  });

//  var form = r.form();
//  form.append('template', fs.createReadStream(path.join(templateDir, global.zipfile)));

}

uploadWithRequest(templateDir, uploadUrl, templateName);