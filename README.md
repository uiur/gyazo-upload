# gyazo-upload
Upload images to gyazo.

``` javascript
var upload = require('gyazo-upload')

upload(['image1.png', 'image2.png']).then(function (urls) {
  // enjoy
})

// you can also pass readableStream or url.
upload([stream, 'http://google.com/logo.png']).then(function (urls) {
  // enjoy
})

```

## Installation
```
npm install gyazo-upload
```

## LICENSE
MIT
