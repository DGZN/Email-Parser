var walker = require('./lib/walker'),
    queue  = require('./lib/queue'),
    debug  = require('debug')('app')
    parser = require('./lib/parser');

var jobs  = new queue({concurrent: 1});
var inbox = new walker({dir: __dirname + '/inbox', max: 100});

inbox.on('file', function(file){
  jobs.add(file, function(file, next){
    next()
    // var parse = new parser(item)
    // parse.on('end', function(order){
    //   console.log(order);
    //   jobs.next()
    // })
  })
})
