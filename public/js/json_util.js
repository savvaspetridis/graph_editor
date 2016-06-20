var fs = require('fs');

module.exports.loadJson = function (file, callback) {
  fs.readFile('file.json', { encoding: 'utf8' }, function (err, data) {
    if (err) return callback(err); // file reading error
    try {
      // parse and return json to callback
      var json = JSON.parse(data);
      callback(null, json);
    } catch (ex) {
      // catch JSON parsing errors so your app doesn't crash
      callback(ex);
    }
  });
};