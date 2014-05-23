var path = require('path')
  , os = require('os')
  , osenv = require('osenv')
  , fs = require('fs')

var path = exports.path = function () {
  switch (os.platform()) {
    case 'darwin':
      return path.resolve(osenv.home(), 'Library/Gyazo/id')
    case 'linux':
      return path.resolve(osenv.home(), '.gyazo.id')
  }
}

module.exports = function () {
  return fs.readFileSync(path())
}
