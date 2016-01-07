var walker = require('./lib/walker'),
    queue  = require('./lib/queue'),
    orders = require('debug')('orders')
    parser = require('./lib/parser');

var jobs  = new queue({concurrent: 1});
var inbox = new walker({dir: __dirname + '/inbox', max: 10000});

inbox.on('file', function(file){
  jobs.add(file, function(file, next){
    var parse = new parser(file)
    parse.on('end', function(order){
      if (order)
        orders(order)
      next()
    })
  })
}).on('end', function(files){
  jobs.finish(() => {
    orders('Parsed ' + files.count + ' files')
  })
})
