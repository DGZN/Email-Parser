var walker = require('./lib/walker'),
    queue  = require('./lib/queue'),
    orders = require('debug')('orders')
    errors = require('debug')('app:errors')
    parser = require('./lib/parser');


var jobs  = new queue({concurrent: 1});
var inbox = new walker({dir: __dirname + '/inbox', max: 10000});

var failed = 0;
inbox.on('file', function(file){
  jobs.add(file, function(file, next){
    var parse = new parser(file)
    parse.on('end', function(order){
      if (!order)
        failed++
      else
        orders(order)
      next()
    })
  })
}).on('end', function(files){
  jobs.finish(() => {
    errors(failed + ' files failed out of ' + files.count)
    orders('Parsed ' + (files.count - failed) + '/' + files.count)
  })
})
