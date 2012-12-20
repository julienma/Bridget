var nconf = require('nconf');

function read (f) {
  nconf.file(f);
  nconf.load();

  console.log('time: ' + nconf.get('time') + ' from ' + f);
}

function save (f) {
  nconf.file(f);
  nconf.set('time', process.hrtime()[0]);

  nconf.save(function (err) {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Configuration saved successfully in ' + f);
  });
}


exports.read = read;
exports.save = save;