var path = require('path')
  , os = require('os')
  , osenv = require('osenv')
  , fs = require('fs')
  , Promise = require('es6-promise').Promise
  , mkdirp = require('mkdirp')

module.exports = function (altPath) {
  var gyazoId = {}

  var idPath = function () {
    if (altPath) return path.resolve(altPath)
    switch (os.platform()) {
    case 'darwin':
      return path.resolve(osenv.home(), 'Library/Gyazo/id')
    case 'linux':
      return path.resolve(osenv.home(), '.gyazo.id')
    }
  }

  function idDir() {
    return path.dirname(idPath())
  }

  var read = gyazoId.read = function () {
    return new Promise(function (resolve, reject) {
      fs.exists(idPath(), function (exists) {
        if (!exists) resolve('')

        fs.readFile(idPath(), function (err, data) {
          if (err) reject(err)

          resolve(data)
        })
      })
    })
  }

  gyazoId.readSync = function () {
    var exists = fs.existsSync(idPath())
    if (!exists) return ''

    var data = fs.readFileSync(idPath())
    return data
  }

  var write = function (data) {
    return new Promise(function (resolve, reject) {
      mkdirp(idDir(), function () {
        fs.writeFile(idPath(), data, function (err) {
          if (err) return reject(err)

          resolve()
        })
      })
    })
  }

  // Write data if id does not exists
  gyazoId.save = function (data) {
    return read().then(function (id) {
      if (id) return

      return write(data)
    })
  }

  return gyazoId
}
