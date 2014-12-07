var request = require('request')
  , fs = require('fs')
  , stream = require('stream')
  , url = require('url')
  , Promise = require('es6-promise').Promise
  , gyazoId = require('./lib/gyazo_id')
  , path = require('path')

function uploadURL(host) {
  host = host || 'http://upload.gyazo.com'
  host = host.replace(/\/$/, '')

  return host + '/upload.cgi'
}

function isURL(str) {
  return !!url.parse(str).host
}

// @param {String or Stream}
// @return {ReadableStream}
function interpretAsStream(input) {
  if (input instanceof stream.Readable) {
    return input
  } else if (isURL(input)) {
    return request(input)
  } else {
    return fs.createReadStream(input)
  }
}

/* Upload stream

   @param {ReadableStream} stream
   @param {Object} options - id, host
   @return {Promise}
*/
function uploadStream(stream, options) {
  options = options || {}

  return new Promise(function (resolve, reject) {
    var r =
      request.post(uploadURL(options.host), function (err, res, url) {
        if (err) return reject(err)

        if (res.headers['x-gyazo-id']) {
          console.log(res.headers['x-gyazo-id'])
          gyazoId(options.id).save(res.headers['x-gyazo-id'])
        }

        resolve(url)
      })

    var form = r.form()

    form.append('imagedata', stream)
    form.append('id', gyazoId(options.id).readSync())
  })
}

/* Upload input images and invoke callback with urls

   @param {[String or Stream]} inputs
                               - file path, url or stream, or an array of them
   @param {Object} options - id, host, output
   @return {Promise}
*/
module.exports = function upload(inputs, options) {
  if (!Array.isArray(inputs)) {
    inputs = [inputs]
  }

  var uploads = inputs.map(function (input) {
    var imageStream = interpretAsStream(input)

    return uploadStream(imageStream, options)
  })

  return Promise.all(uploads)
}
