var http = require('http');
var fs = require('fs');
var path = require('path');

var filename = '/Users/julien/';

http.createServer(function (request, response) {
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    fs.readdir(filename, function(err, files) {
        if(err) {
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("Yooo!\n");
        files.forEach(function(file) {
          console.log(file);
          response.write(file + '\n');
        });
        response.end();
    });
  });

}).listen(1337);

