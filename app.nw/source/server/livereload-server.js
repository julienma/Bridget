/*
  LiveReload Server
  - listen to incoming LR Clients (sockets), and server /livereload.js script, or local cached version of the file (overrideURL)
  - send 'reload' requests to LR Clients
*/

// ANSI color codes for console.log(). Always 'reset' after a color.
var red   = '\u001b[31m',
    green = '\u001b[32m',
    blue  = '\u001b[34m',
    cyan  = '\u001b[36m',
    reset = '\u001b[0m';

var fs   = require('fs');
var path = require('path');
var crypto = require('crypto');
var LRWebSocketServer = require('livereload-server');
// require local Notification package
var notification = require('./notification.js');

// id, name, version identifies your app;
// protocols specifies the versions of subprotocols you support
var server = new LRWebSocketServer({ id: "com.leadformance.bridget", name: "Bridget", version: "1.0", protocols: { monitoring: 7, saving: 1 } });

// array of all LR clients connected to server (could be javascript snippet or browser extension)
var connections = [];

// Exception handling, as livereload-server is throwing them out...
process.on('uncaughtException', function(err) {
  console.log(red + 'ERROR: ' + err + reset);
  notification.send('Livereload error', 'Livereload error (' + err + ')', true);
});

// calculate a random salt for SHA1 signature generation
function random8() {
  return Math.random().toString(36).substr(2,8);
}
function random40() {
  return random8() + random8() + random8() + random8() + random8();
}
var salt = random40();

function sign (path) {
  return crypto.createHmac('sha1', salt).update(path).digest('hex');
}

/*
  - urlPath is the path of the local cached resource
  ex: /_livereload/url-override-v1/9d5945a0740c64bf84a7571841ce6e9f65f1ba6e/my/template/stylesheets/combined.css
  - signature is the signed path, extracted from urlPath
  - localPath is the actual local path, extracted from urlPath
  ex: /my/template/stylesheets/combined.css
*/
function localPathForUrlPath(urlPath) {
  var localPath, m, signature, _;
  // regex - check that urlPath contains the overrideURL pattern + signed path + actual local path
  if (m = urlPath.match(/^\/_livereload\/url-override-v1\/([a-z0-9]{40})(\/.*)$/)) {
    _ = m[0], signature = m[1], localPath = m[2];
    localPath = decodeURI(localPath);
    console.log("localPathForUrlPath: localPath = " + localPath);
    // check if signature from urlPath match the signature generated from localPath
    if (sign(localPath) === signature) {
      // ok, the requested resource has been overriden, let's serve it locally
      return [200, localPath];
      // no, this is probably an obsolete cached version, let's 403 so it is not overriden
    } else {
      return [403];
    }
  }
  // there's no match, this is not a file which we want to force serve locally
  return [404];
}

// send payload to all connected LR Client
function sendReloadRequests (filePath) {
  console.log(green + "Reload request triggered by " + reset + filePath);

  // TODO: win compatibility: under windows, modify \\ with / (?)

  // encode filepath, so it travels safely on the interweb
  filePath = encodeURI(filePath);
  // construct request payload - HAVE TO respect livereload protocol
  var payload = {
    command: 'reload',
    path: filePath,
    liveCSS: true,
    originalPath: '',
    // construct overrideURL, so we can force local cached files on remote servers (ex: css, or pictures)
    overrideURL: '/_livereload/url-override-v1/' + sign(filePath) + filePath
  };

  // hold all the results
  var results = [];
  // loop through all the current connections
  for (i = 0, len = connections.length; i < len; i++) {
    connection = connections[i];
    // send each the payload (reload request) and return the results
    results.push(connection.send(payload));
  }
  return results;
}

/*
Socket server events
*/

// LR client connected
server.on('connected', function(connection) {
  console.log(blue + "Client connected (" + connection.id + ")" + reset);
  // add this connection to the array of connections
  connections.push(connection);
});


// LR client disconnected
server.on('disconnected', function(connection) {
  console.log(blue + "Client disconnected (" + connection.id + ")" + reset);
  // find the current connection in the array of connections
  var index = connections.indexOf(connection.id);
  // and remove it
  connections.splice(index, 1);
  // close its socket
  connection.close();
});


// LR client send a command (like 'info')
server.on('command', function(connection, message) {
  console.log("Received command " + message.command + ": %j" + message);
});


server.on('error', function(err, connection) {
  console.log("Error (" + connection.id + "): " + err.message);
  notification.send('Livereload error', 'Livereload error (' + err.message + ')', true);
});


// LR client request livereload.js
server.on('livereload.js', function(request, response) {
  console.log("Serving livereload.js.");
  var jsPath = path.join(__dirname, '../client/livereload.js');
  fs.readFile(jsPath, 'utf8', function(err, data) {
    if (err) {
      console.log(red + 'ERROR: cannot read ' + jsPath + reset + ' (' + err + ')');
      notification.send('Livereload error', 'Livereload error: cannot read ' + jsPath + ' (' + err + ')', true);
    } else {
      response.writeHead(200, {'Content-Length': data.length, 'Content-Type': 'text/javascript'});
      response.end(data);
    }
  });
});


// LR client request other resource. It is primarly used to serve 'local' versions of CSS/img when using overrideURL. This will be triggered after a 'reload' request is sent to every LR Client.
server.on('httprequest', function(url, request, response) {
  console.log("HTTPRequest: ");
  // check if we want to serve a local cached version of the requested file
  var getLocalResource = localPathForUrlPath(url.pathname);

  // we got a HTTP 200: we want to cache that file locally
  if(getLocalResource[0] == 200) {
    console.log(green + 'Local cache exists => 200 - ' + getLocalResource[1] + reset);
    // default headers to send
    var statusCode = 404,
        headers,
        encoding;

    fs.readFile(getLocalResource[1], function(err, data) {
      if (err) {
        console.log(red + 'ERROR: cannot read ' + getLocalResource[1] + reset + ' (' + err + ')');
      } else {
        // get the file extension
        var ext = path.extname(getLocalResource[1]);
        console.log('Ext: '+cyan+ext+reset+' for file ' + cyan + getLocalResource[1]+reset);

        // if file extension is known, set the MIME type accordingly
        switch (ext) {
          case('.css'):
            console.log('This is CSS');
            statusCode = 200;
            headers = {'Content-Length': data.length, 'Content-Type': 'text/css'};
            encoding = 'utf8';
            break;
          // in case of known picture formats, just use the file extension as MIME type, minus leading '.'
          case('.png'):
          case('.gif'):
          case('.jpeg'):
            console.log('This is an IMAGE: ' + cyan+ext+reset);
            statusCode = 200;
            headers = {'Content-Length': data.length, 'Content-Type': 'image/' + ext.replace('.','')};
            break;
          // in case of .jpg, force the MIME type to 'image/jpeg'
          case('.jpg'):
            console.log('This is an IMAGE: ' + cyan+ext+reset);
            statusCode = 200;
            headers = {'Content-Length': data.length, 'Content-Type': 'image/jpeg'};
            break;
          default:
            // empty the data so it is not sent with a 404
            data = '';
        }
      }

      // send the actual response
      response.writeHead(statusCode, headers);
      response.write(data, encoding);
      response.end();
    });

  // we don't want to force a local version of the file
  } else {
    console.log(red + 'No local cache => 404' + reset);
    response.writeHead(404);
    response.end();
  }

});

// LR server starts listening
server.listen(function(err) {
  if (err) {
      console.error("Listening failed: " + err.message);
      notification.send('Livereload error', 'Livereload can\'t start listening (' + err.message + ')', true);
      return;
  }
  console.log("Listening on port " + server.port);
});

exports.sendReloadRequests = sendReloadRequests;
