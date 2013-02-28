$(document).ready(function(){

/*
  Save the settings with HTML5 LocalStorage
*/
  function saveAdvancedSettings () {
    global.settingsUploadDelay = $('#settings-upload-delay').val();
    // proxy through global. as we can't use the same localStorage syntax from template.js
    localStorage.settingsUploadDelay = global.settingsUploadDelay;
    window.close();
  }

/*
  Display current settings in modal
*/
  $('#advanced-settings').on('show', function () {
    $('#settings-upload-delay').val(localStorage.settingsUploadDelay);
  });

  $('#advanced-settings').on('hide', function () {
    window.close();
  });

/*
  assign actions to buttons & form action
*/
  $('#save-advanced-settings').click(saveAdvancedSettings);
  $('#advanced-settings-form').submit(saveAdvancedSettings);

/*
  show the modal
*/
  $('#advanced-settings').modal('show');

});
