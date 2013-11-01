var run = require('tape').test
var stream = require('../')

var random = function() {
  var types= [{}, function(){}]
  var random = ~~(Math.random() * 2)
  return types[random]
}

var source, destination
var setup = function() {
  source = random()
  destination = random()
  
  stream.call(source)
  stream.call(destination)

  source.readable = true
  destination.writable = true

  source.pipe(destination)
}

run('it mixes in', function(test) {
  var obj = {}
  var fn = function() {}

  stream.call(obj)
  stream.call(fn)
  
  test.ok(obj.pipe, 'object has pipe')
  test.ok(obj.emit, 'object has emit')
  test.ok(fn.pipe, 'function has pipe')
  test.ok(fn.emit, 'function has emit')
  test.end()
})

run('it pipes data', function(test) {
  setup()

  destination.write = function(data) {
    test.equal(data, 'like a boss', 'yes it does')
    test.end()
  }
  source.emit('data', 'like a boss')
})

run('it only writes to writable streams', function(test) {
  setup()
  test.plan(1)

  destination.writable = false
  destination.write = function(data) {
    test.ok(false, 'written to destination')
  }

  source.emit('data', 'mario')

  test.ok(true, 'yes it does')
})

run('it pauses', function(test) {
  setup()

  source.pause = function() {
    test.ok(true, 'yes it does')
    test.end()
  }

  destination.write = function(data) { 
    return false
  }

  source.emit('data', 'mario')
  source.emit('data', 'luigi')
})

run('it resumes', function(test) {
  setup()

  var buffer = null

  destination.write = function(data) {
    if (data === 'mario') {
      // Resume it
      setTimeout(function() {
        destination.emit('drain')
      }, 1)

      // Pause it
      return false
    }
    test.ok(data === 'luigi', 'yes it does')
    test.end()
  }
  
  source.pause = function() {
    buffer = 'luigi'
  }

  source.resume = function() {
    test.ok(true, 'yes it does')
    source.emit('data', buffer) 
  }

  source.emit('data', 'mario')
})

run('it ends', function(test) {
  setup()
  destination.end = function() {
    test.ok(true, 'yes it does')
    test.end()
  }
  source.emit('end')
})

run('it only ends once', function(test) {
  setup()
  test.plan(1)
  var didOnEnd = false
  destination.end = function() {
    if (didOnEnd) {
      test.ok(false, 'end called twice')
    }
  }
  source.emit('end')
  source.emit('end')
  test.ok(true, 'yes it does')
})

run('it closes', function(test) {
  setup()
  destination.destroy = function() {
    test.ok(true, 'yes it does')
    test.end()
  }
  source.emit('close')
})

run('it closes without being handled', function(test) {
  source.emit('close')
  test.end()
})

run('it throw errors on uncaught exceptions in source', function(test) {
  setup()

  try {
    source.emit('error', new Error('some error'))
  }
  catch (error) {
    test.ok(error instanceof Error, 'yes it does')
    test.end()
  }
})

run('it throws errors on uncaught exceptions in destination', function(test) {
  setup()

  try {
    destination.emit('error', new Error('some error'))
  }
  catch (error) {
    test.ok(error instanceof Error, 'yes it does')
    test.end()
  }
})

run('it doesn’t throw errors if listeners are present', function(test) {
  setup()
  source.on('error', function(error) {
    test.ok(true, 'yes it does…n’t')
    test.end()
  })
  source.emit('error', new Error('done'))
})

var populated = function(source, destination) {
  return !!(
    source.listeners('data').length + 
    destination.listeners('drain').length + 
    source.listeners('end').length + 
    source.listeners('close').length + 
    destination.listeners('end').length + 
    destination.listeners('close').length
  )
}

run('it removes listeners on error in source', function(test) {
  setup()
  source.on('error', function(){})
  source.emit('error', new Error('test'))
  test.ok(!populated(source, destination), 'yes it does')
  test.end()

})

run('it removes listeners on error in destination', function(test) {
  setup()
  destination.on('error', function(){})
  destination.emit('error', new Error('test'))
  test.ok(!populated(source, destination), 'yes it does')
  test.end()
})

run('it removes listeners on end in source', function(test) {
  setup()
  destination.end = function(){}
  source.emit('end')
  test.ok(!populated(source, destination), 'yes it does')
  test.end()
})

run('it removes listeners on close in source', function(test) {
  setup()
  destination.close = function(){}
  source.emit('close')
  test.ok(!populated(source, destination), 'yes it does')
  test.end()
})

run('it removes listeners on end in destination', function(test) {
  setup()
  destination.end = function(){}
  destination.emit('end')
  test.not(populated(source, destination), 'yes it does')
  test.end()
})

run('it removes listeners on close in destination', function(test) {
  setup()
  destination.close = function(){}
  destination.emit('close')
  test.not(populated(source, destination), 'yes it does')
  test.end()
})

run('it emits pipe in destination', function(test) {
  setup()
  destination.on('pipe', function() {
    test.ok(true, 'yes it does')
    test.end()
  })
  source.pipe(destination)
})

run('it ends if specified', function(test) {
  source = random()
  destination = random()
  
  stream.call(source)
  stream.call(destination)

  source.readable = true
  destination.writable = true

  destination.end = function() {
    throw new Error('shouldn\'t be called')
  }

  source.pipe(destination, { end: false })
  source.emit('end')

  test.ok(true, 'yes it does')
  test.end()
})
