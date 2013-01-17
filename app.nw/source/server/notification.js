// Shows two Growl notification on the local machine
var growler = require('growler'),
    fs = require('fs');

// put icons in buffer
var iconSuccess = fs.readFileSync('source/img/tray-icon.png'),
    iconFailure = fs.readFileSync('source/img/tray-icon-active.png');

// Create a Growl application
var growl = new growler.GrowlApplication('Bridget', {
  icon: iconSuccess // Buffer
});
growl.setNotifications({
  'Upload Success': {
    // see https://github.com/betamos/Node-Growler/blob/master/lib/growler.js#L104
    // icon: null, // Overridable
    // displayName: 'The Server\'s current status',
    // enabled: true // If the notification should be enabled by default
  },
  'Upload Failure': {
    icon: iconFailure
  },
  'Watch Success': {
  },
  'Watch Failure': {
    icon: iconFailure
  }
});

function alertFallback (msg) {
  console.log('GROWL fallback: ' + msg);
  window.alert(msg);
}

/*
Display notifications using Growl if available, otherwise fallback to window.alert()
isError should be set to true if the notification has to stay on screen

Usage:
  send('Upload Success', 'Upload Successful');
  send('Upload Failure', 'Upload Failed (could be zip or cURL issue)', true);
*/
function send (notification, text, isError) {
  // Must register to send messages
  growl.register(function(success, err) {
    if (!success)
      throw err;
    // Wait for register to complete before sending notifications
    growl.sendNotification(notification, {
      title: (isError)?'Bridget ERROR':'Bridget',
      text: text,
      sticky: (isError)?true:false // Stay on screen
    }, function(success, err) { // Callback
      if (success)
        console.log('GROWL: OK');
      else {
        // fallback to standard alert() if growl is not working, but ONLY for ERRORS - don't want to annoy user
        if(isError) {
          alertFallback('Bridget ERROR!\n' + text);
          // throw err;
        }
      }
    });
  });
}

exports.send = send;
