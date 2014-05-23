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

/* Upload stream

   @param {ReadableStream} stream
   @param {Object} options - id, host
   @return {Promise}
*/
function uploadStream(stream, options) {
  options = options || {}

  return new Promise(function (resolve, reject) {
    var requestStream =
      request.post(uploadURL(options.host), function (err, res, url) {
        if (err) reject(err)

        resolve(url)
      })

    var form = requestStream.form()

    form.append('imagedata', stream)

    var id = options.id
           ? fs.readFileSync(path.resolve(process.cwd(), options.id))
           : gyazoId()

    form.append('id', id)
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
    var imageStream

    if (input instanceof stream.Readable) {
      imageStream = input
    } else if (isURL(input)) {
      var url = input

      imageStream = request(url)
    } else {
      imageStream = fs.createReadStream(input)
    }

    return uploadStream(imageStream, options)
  })

  return Promise.all(uploads)
}
