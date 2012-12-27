$(document).ready(function(){

  // track current API server to use, from Array apiServer
  var currentApiServer = 0;

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
      displayAlert('#step1 #alert', '<strong>Oops! </strong>Please fill in your API key!', 'error');
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
            displayAlert('#step1 #alert', '<strong>Alright! </strong>Now select your template slot');

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

          // returned data is empty
          } else {
            console.log('API: empty output');
            displayAlert('#step1 #alert', '<strong>Oops! </strong>I got no data back. Check your API key!', 'error');
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
    displayAlert('#step1 #alert', 'Using template slot <strong>'+templateName+' - ID: '+templateId+'</strong> on server <strong>BLA</strong>', 'success');
    $('#local-folder-form button').focus();

    return false;
  }

/*
  Triggered when clicking cancel on the template selection
*/
  function cancelSelectTemplate () {
    displayAlert('#step1 #alert', 'Cancelled! TEST');
    // ...then display #api-key-form, hide #template-form, and focus the api key field
    $('#template-form').addClass('hide');
    $('#api-key-form').removeClass('hide');
    $('#api-key-form #api-key').focus();
    $('#api-key-form #api-key').select();

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
      console.log($(this).val());
      displayAlert('#step2 #alert', 'Using <strong>' + $(this).val() + '</strong> as local folder', 'success');
    });

    return false;
  }

  function saveSettings () {
    settings.save(function (result, alertType){
      displayAlert('#step2 #alert', result, alertType);
    });
    $('#save-settings').addClass('btn-success');
    $('#save-settings').text('Done!');

    return false;
  }

/*
  assign actions to buttons
*/
  $('#api-key-form button').click(getTemplateList);
  $('#templateList').change(selectTemplate);
  $('#template-form button').click(cancelSelectTemplate);
  $('#local-folder-form button').click(function(){
    selectLocalFolder('#browseLocalFolder');
    return false;
  });
  $('#save-settings').click(saveSettings);

/*
  focus API key field at startup
*/
  $('#api-key').focus();

});
