# stream-mixin
stream-mixin is a classic-stream mixin for browser code. It uses the [functional mixin](https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/) pattern to add [classic stream](https://github.com/joyent/node/blob/72ce9baa75434f64e42ee4e666897ddfd754c822/lib/stream.js) [functionality](http://nodejs.org/docs/v0.8.9/api/stream.html) to your objects.

[![Build status](https://travis-ci.org/michaelrhodes/stream-mixin.png?branch=master)](https://travis-ci.org/michaelrhodes/stream-mixin)

[![Browser support](https://ci.testling.com/michaelrhodes/stream-mixin.png)](https://ci.testling.com/michaelrhodes/stream-mixin)

## Install

``` sh
$ npm install stream-mixin
```
…or just grab a pre-built standalone version from the project’s build directory.

## Usage
``` js
var stream = require('stream-mixin')

// Make a stream from an Object…
var mailman = {}
stream.call(mailman)
mailman.writable = true 
mailman.write = function(data) {
  if (/!/.test(data)) {
    mailman.emit('data', 'ARRGH!')
  }
}

// …or a Class
var Dog = function() {}
var dog = new Dog
stream.call(Dog.prototype)
Dog.prototype.readable = true
Dog.prototype.bark = function() {
  this.emit('data', 'woof!')
}

// Listen to events explicitly…
mailman.on('data', function(data) {
  console.log('mailman says: ' + data)
})

// …or implictly
dog.pipe(mailman)

// Ok, go!
dog.bark()
```

### Note
juliangruber’s [module](https://github.com/juliangruber/stream) is almost identical to this one, but it depends on the [component](https://github.com/component/component) package manager; this made it inappropriate for me.


### License
[MIT](http://opensource.org/licenses/MIT)
