$(document).ready(function(){

/*
  Save the settings with HTML5 LocalStorage
*/
  function saveAdvancedSettings () {
    global.settingsUploadDelay = $('#settings-upload-delay').val();

    if ($('#settings-auto-upload').attr('checked')) {
      global.settingsAutoUpload = 'true';
    } else {
      global.settingsAutoUpload = 'false';
    }

    // proxy through global. as we can't use the same localStorage syntax from template.js
    localStorage.settingsUploadDelay = global.settingsUploadDelay;
    localStorage.settingsAutoUpload = global.settingsAutoUpload;
    window.close();
  }

/*
  Display current settings in modal
*/
  $('#advanced-settings').on('show', function () {
    // upload delay
    $('#settings-upload-delay').val(localStorage.settingsUploadDelay);
    // auto-upload
    if (localStorage.settingsAutoUpload === 'true') {
      $('#settings-auto-upload').attr('checked', 'checked');
    } else {
      $('#settings-auto-upload').removeAttr('checked');
    }
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
