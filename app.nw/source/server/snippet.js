var rest = require('restler');
var fs = require('fs');

// require common serverlist (both server & browser)
var serverlist = require('../client/serverlist.js');
// require local Settings package (nconf)
var settings = require('./settings.js');

// used to store all snippets' name and IDs
var snippetList = {};

/*
  For a specific templateId, get snippet ID from its name, or return false
*/
function getId (templateId, snippetName, callback) {
  // if we already have a list of snippets for the template, and it contains some snippets
  if(snippetList[templateId]){
    if (Object.keys(snippetList[templateId]).length > 0) {
      // find out if snippetName exists (we would have its ID)
      var id = snippetList[templateId][snippetName];
      callback(false, id);
      return;
    }
  }
  callback(true);
}

/*
  Get a list of every snippets of a template
*/
function getAllIds(fromTemplate, callback) {
  // construct the "snippet list" API Url
  var url = serverlist.getServerDetails(settings.loadedSettings[fromTemplate].serverId, serverlist.apiServer).url + '/templates/' + settings.loadedSettings[fromTemplate].templateId + '/snippets.json?oauth_token=' + settings.loadedSettings[fromTemplate].apiKey;
  // get all the snippets from the API
  rest.get(url, {parser: rest.parsers.json}).on('complete', function(res) {
    /*
    res[key].name is snippet name
    res[key].id is snippet ID
    res[key].content is actual HTML content of the snippet
    */

    console.log('Got SNIPPETS for template ' + settings.loadedSettings[fromTemplate].templateName);

    if (res instanceof Error) {
        //console.log('SNIPPET error: ' + res.message);
        callback(true, res.message);
      } else {
        // for each templateId (actual API template ID )
        var templateId = settings.loadedSettings[fromTemplate].templateId;
        // ...create a new object...
        snippetList[templateId] = {};
        // ...and store correspondance between snippet names and IDs, so we can get snippet ID from its name, like this: snippetList[templateId][name_of_the_snippet]
        for (var key in res){
          //console.log('SNIPPETS ' + '(' + fromTemplate + ') - ' + key + ' = ' + res[key].name + ' (' + res[key].id + ')');
          snippetList[templateId][res[key].name] = res[key].id;
        }
        // return number of snippet items for that template
        callback(false, Object.keys(snippetList[templateId]).length);
      }
  });
}

/*
  Update a snippet
*/
function update(fromTemplate, snippetId, filePath, callback) {
  // construct the API call url
  var url = serverlist.getServerDetails(settings.loadedSettings[fromTemplate].serverId, serverlist.apiServer).url + '/templates/' + settings.loadedSettings[fromTemplate].templateId + '/snippets/' + snippetId + '.json?oauth_token=' + settings.loadedSettings[fromTemplate].apiKey;
  console.log('Update SNIPPETS for template ' + settings.loadedSettings[fromTemplate].templateName + ' from ' + url);

  // read the snippet html file
  fs.readFile(filePath, 'utf8', function(err, fileData) {
    if (err) {
      console.log('## FILE error: ' + err);
      callback(true, 'Can\'t read file. Error: ' + err);
      return;
    } else {
      console.log('## FILE ok: ' + filePath);

      // construct json request body
      var jsonData = {
        "snippet": {
          "content": fileData
        }
      };
      jsonData = JSON.stringify(jsonData);

      // update snippetId through the API
      rest.put(url, {
        parser: rest.parsers.json,
         headers: {
          'Accept': '*/*',
          'User-Agent': 'Bridget',
          'Content-Type': 'application/json'
        },
        data: jsonData
     }).on('complete', function(res) {
        if (res instanceof Error) {
          callback(true, res.message);
          return;
        } else if (res.errors) {
          var errorMsg = '';
          for (var key in res.errors){
            errorMsg = '- ' + key + ': ' + res.errors[key] + '\n';
          }
          callback(true, errorMsg);
          return;
        } else {
          callback(false);
          return;
        }
      });

    }
  });

}

/*
  Create a snippet
*/
function create(fromTemplate, snippetName, filePath, callback) {
  // construct the API call url
  var url = serverlist.getServerDetails(settings.loadedSettings[fromTemplate].serverId, serverlist.apiServer).url + '/templates/' + settings.loadedSettings[fromTemplate].templateId + '/snippets.json?oauth_token=' + settings.loadedSettings[fromTemplate].apiKey;
  console.log('Create SNIPPETS for template ' + settings.loadedSettings[fromTemplate].templateName + ' from ' + url);

  // read the snippet html file
  fs.readFile(filePath, 'utf8', function(err, fileData) {
    if (err) {
      console.log('## FILE error: ' + err);
      callback(true, 'Can\'t read file. Error: ' + err);
      return;
    } else {
      console.log('## FILE ok: ' + filePath);

      // construct json request body
      var jsonData = {
        "snippet": {
          "content": fileData,
          "name": snippetName
        }
      };
      jsonData = JSON.stringify(jsonData);

      // create snippetName through the API
      rest.post(url, {
        parser: rest.parsers.json,
         headers: {
          'Accept': '*/*',
          'User-Agent': 'Bridget',
          'Content-Type': 'application/json'
        },
        data: jsonData
     }).on('complete', function(res) {
        if (res instanceof Error) {
          callback(true, res.message);
          return;
        } else if (res.errors) {
          var errorMsg = '';
          for (var key in res.errors){
            errorMsg = '- ' + key + ': ' + res.errors[key] + '\n';
          }
          callback(true, errorMsg);
          return;
        } else {
          // return snippetId
          callback(false, res.id);
          return;
        }
      });

    }
  });

}

/*
  Delete a snippet
*/
function del(fromTemplate, snippetId, callback) {
  // construct the API call url
  var url = serverlist.getServerDetails(settings.loadedSettings[fromTemplate].serverId, serverlist.apiServer).url + '/templates/' + settings.loadedSettings[fromTemplate].templateId + '/snippets/' + snippetId + '.json?oauth_token=' + settings.loadedSettings[fromTemplate].apiKey;
  console.log('Delete SNIPPETS for template ' + settings.loadedSettings[fromTemplate].templateName + ' from ' + url);

  // construct json request body
  var jsonData = {};

  // delete snippetId through the API
  rest.del(url, {
    parser: rest.parsers.json,
     headers: {
      'Accept': '*/*',
      'User-Agent': 'Bridget',
      'Content-Type': 'application/json'
    },
    data: jsonData
 }).on('complete', function(res) {
    if (res instanceof Error) {
      callback(true, res.message);
      return;
    } else if (res.errors) {
      var errorMsg = '';
      for (var key in res.errors){
        errorMsg = '- ' + key + ': ' + res.errors[key] + '\n';
      }
      callback(true, errorMsg);
      return;
    } else {
      callback(false);
      return;
    }
  });

}

exports.getAllIds = getAllIds;
exports.getId = getId;
exports.update = update;
exports.create = create;
exports.del = del;