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
    },
    {
      id:'sandbox',
      url:'https://api-sandbox.leadformance.com',
      name:'Sandbox (.sandbox)'
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
  }

/*
  Try getting the template list through API. Cycle through multiple API servers until finding one working.
*/

  function getTemplateList(){
    var apiKey = $('#api-key').val();
    var apiMethod = '/templates.json?oauth_token=' + apiKey;

    if(apiKey === ''){
      // error if api key is not keyed in
      displayAlert('#api-key-form #alert', '<strong>Error: </strong>Please fill in your API key', 'error');
    } else {
      // else display a waiting message...
      displayAlert('#api-key-form #alert', '<strong>Alright! </strong>Trying to fetch templates from ' + apiServer[currentApiServer].name);
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
            // reactivate the refresh button if we've found the API server
            $('#api-key-form button').removeAttr('disabled', 'disabled');
            $('#api-key-form #api-key').removeAttr('disabled', 'disabled');
            $('#movingBallG').addClass('hide');
          }
        },
        success: function(data, textStatus, xhr) {
          //called when successful
          if (data.length !== 0){
            console.log('API: got template list');
            displayAlert('#api-key-form #alert', '<strong>Alright! </strong>We got your template list!', 'success');

            // clean the current list of template values in the select...
            var template_list = $('#template_list');
            template_list.find('option').remove();

            // ...and update the select with the new template values
            template_list.append("<option>Please choose a template</option>");
            $.each(data, function(index, item){
              template_list.append("<option value=" + item.id + ">" + item.name + "</option>");
            });

          // returned data is empty
          } else {
            console.log('API: empty output');
            displayAlert('#api-key-form #alert', '<strong>Oops! </strong>We got no data back. Check your API key!', 'error');
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
            displayAlert('#api-key-form #alert', '<strong>Sorry, </strong>there has been an error with the API (timeout, auth, etc.)', 'error');
            currentApiServer = 0;
          }
        }
      });

    }

    return false;
  }

  // assign actions to buttons
  $('#api-key-form button').click(getTemplateList);

});
