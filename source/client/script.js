$(document).ready(function(){

  // track current API server to use, from Array apiServer
  var currentApiServer = 0;

  // define structure for templateSettings, used to keep settings before saving with nconf
  var templateSettings = {
    path:'',
    serverId:'',
    apiKey:'',
    templateId:'',
    templateName:''
  };

  // Define URLs for known API servers
  var apiServer = [
    {
      id:'q',
      url:'https://api-q.leadformance.com',
      name:'Internal QA (.q)'
    },
    {
      id:'c',
      url:'https://api-c.leadformance.com',
      name:'Client QA (.c)'
    },
    {
      id:'i',
      url:'https://api-i.leadformance.com',
      name:'Integrator (.i)'
    },
    {
      id:'s',
      url:'https://api-s.leadformance.com',
      name:'Staging (.s)'
    }
  ];

/*
  Find details (url, name) about a server, given its id ('c', 'q', etc.)
  Usage: console.log(getServerDetails('c')[0].url);
*/
  function getServerDetails(id){
    return $.grep(apiServer, function(item){
      if (item.id == id) {
        return item;
      }
    });
  }


/*
  Display alert message in the specified 'alert' div
  Usage:
  - div: selector to 'alert' div
  - message: html message
  - alertType (optional) = info, success, error (or blank for default 'alert')
*/
  function displayAlert(div, message, alertType){
      var myDiv = $(div);
      myDiv.html(message);
      myDiv.removeClass('alert-success alert-error alert-info');
      myDiv.addClass('alert' + ((alertType) ? '-' + alertType : ''));

      return false;
  }

/*
  Try getting the template list through API. Cycle through multiple API servers until finding one working.
*/

  function getTemplateList(){
    var apiKey = $('#api-key').val();
    var apiMethod = '/templates.json?oauth_token=' + apiKey;

    if(apiKey === ''){
      // error if api key is not keyed in
      displayAlert('#step1 #alert', '<strong>Oops! </strong>Please fill in your API key', 'error');
      $('#api-key-form #api-key').focus();
    } else {
      // else display a waiting message...
      displayAlert('#step1 #alert', 'Trying to fetch templates from ' + apiServer[currentApiServer].name);
      // ...and disable input + button while checking if the API key is valid
      $('#api-key-form button').attr('disabled', 'disabled');
      $('#api-key-form #api-key').attr('disabled', 'disabled');
      $('#movingBallG').removeClass('hide');

      // get template list from API
      console.log('Request: ' + apiServer[currentApiServer].url + apiMethod);
      $.ajax({
        url: apiServer[currentApiServer].url + apiMethod,
        crossdomain: 'true',
        type: 'POST',
        dataType: 'jsonp',
        timeout: 2000,
        // data: {},
        complete: function(xhr, textStatus) {
          //called when complete
          if(!currentApiServer) {
            // reactivate the refresh button if I've found the API server
            $('#api-key-form button').removeAttr('disabled', 'disabled');
            $('#api-key-form #api-key').removeAttr('disabled', 'disabled');
            $('#movingBallG').addClass('hide');
          }
        },
        success: function(data, textStatus, xhr) {
          //called when successful
          if (data.length !== 0){
            console.log('API: got template list');
            displayAlert('#step1 #alert', '<strong>Alright! </strong>Your key is valid on <strong>' + apiServer[currentApiServer].name + '</strong>. Now select your template slot', 'info');

            // clean the current list of template values in the select...
            var templateList = $('#templateList');
            templateList.find('option').remove();
            // ...and update the select with the new template values...
            templateList.append("<option value=''>Please choose a template</option>");
            $.each(data, function(index, item){
              templateList.append("<option value=" + item.id + ">" + item.name + " (" + item.id + ")</option>");
            });
            // ...then hide #api-key-form, display #template-form, and focus the template droplist
            $('#api-key-form').addClass('hide');
            $('#template-form').removeClass('hide');
            templateList.focus();

            // save the server settings
            templateSettings.serverId = apiServer[currentApiServer].id;
            templateSettings.apiKey = apiKey;

          // returned data is empty
          } else {
            console.log('API: empty output');
            displayAlert('#step1 #alert', '<strong>Oops! </strong>I got no data back. Check your API key', 'error');
          }
          currentApiServer = 0;
        },
        error: function(xhr, textStatus, errorThrown) {
          //called when there is an error
          console.log('API: error, cycling API server');
          // cycle to next API server, and start the AJAX query again
          if(currentApiServer < (apiServer.length - 1)) {
            currentApiServer++;
            console.log('Trying ' + apiServer[currentApiServer].name + ' - ' + apiServer[currentApiServer].url + ' (' + apiServer[currentApiServer].id + ')');
            getTemplateList();
          } else {
            console.error('API: timeout');
            displayAlert('#step1 #alert', '<strong>Sorry, </strong>there is an issue, either with your key or the API :(', 'error');
            currentApiServer = 0;
            // focus the api key field, for easy correction
            $('#api-key-form #api-key').focus();
            $('#api-key-form #api-key').select();
          }
        }
      });

    }

    return false;
  }

/*
  Triggered once the template is selected from droplist
*/
  function selectTemplate () {
    var templateId = $('#templateList').val();
    var templateName = $('#templateList option:selected').text();
    displayAlert('#step1 #alert', 'Using <strong>'+templateName+'</strong> on <strong>' + getServerDetails(templateSettings.serverId)[0].name + '</strong>', 'success');
    //$('#save-settings').focus();

    // save the template settings
    templateSettings.templateId = templateId;
    templateSettings.templateName = templateName;

    return false;
  }

/*
  Triggered when clicking cancel on the template selection
*/
  function cancelSelectTemplate () {
    displayAlert('#step1 #alert', 'Please fill in your <strong>write_templates</strong> API key', 'info');
    // ...then display #api-key-form, hide #template-form, and focus the api key field
    $('#template-form').addClass('hide');
    $('#api-key-form').removeClass('hide');
    $('#api-key-form #api-key').focus();
    $('#api-key-form #api-key').select();

    // reset the template settings
    templateSettings.templateId = '';
    templateSettings.templateName = '';

    return false;
  }

/*
  Use node-webkit native API to display a Directory only file dialog
  https://github.com/rogerwang/node-webkit/wiki/File-dialogs
*/
  function selectLocalFolder(name) {
    var chooser = $(name);
    chooser.trigger('click');
    chooser.change(function(evt) {
      if ($(this).val()) {
        console.log($(this).val());
        displayAlert('#step2 #alert', 'Using <strong>' + $(this).val() + '</strong>', 'success');
        // save the path settings
        templateSettings.path = $(this).val();
        checkIfEnableSave();
      }
    });
    return false;
  }

/*
  Save settings (server, templates, path, etc.) in a json file, through nconf
*/
  function saveSettings () {
    settings.save(templateSettings, function (err, file){
      if (err) {
        console.error(err);
        displayAlert('#step2 #alert', 'Error: ' + err, 'error');
        return;
      }
      console.log('Configuration saved successfully in ' + file);
      //displayAlert('#step2 #alert', 'Configuration saved successfully in ' + file, 'success');
    });
    $('#save-settings').attr('disabled', 'disabled');
    $('#save-settings').addClass('btn-success');
    $('#save-settings').text('Done!');

    return false;
  }

/*
  Enable/disable the save button if all the settings are set or not
*/
  function checkIfEnableSave () {
    // check if all the settings are set
    for (var name in templateSettings) {
      // one setting is missing
      if(!templateSettings[name] || templateSettings[name]===''){
        $('#save-settings').attr('disabled', 'disabled');
        $('#api-key-form #api-key').focus();
        $('#api-key-form #api-key').select();
        return;
      // else enable the save button
      } else {
        $('#save-settings').removeAttr('disabled', 'disabled');
        $('#save-settings').focus();
      }
    }
    return false;
  }


/*
  assign actions to buttons
*/
  $('#api-key-form button').click(getTemplateList);
  $('#templateList').change(function(){
    selectTemplate();
    checkIfEnableSave();
  });
  $('#template-form button').click(function(){
    cancelSelectTemplate();
    checkIfEnableSave();
  });
  $('#local-folder-form button').click(function(){
    selectLocalFolder('#browseLocalFolder');
    return false;
  });
  $('#save-settings').click(saveSettings);

/*
  focus local folder field at startup
*/
  //$('#api-key').focus();
  //$('#local-folder-form button').focus();

});
