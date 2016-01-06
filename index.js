var walker = require('./walker'),
    queue  = require('./queue'),
    parser = require('./parser'),
      jobs = new queue({concurrent: 1}),
     inbox = new walker({
      dir: __dirname + '/inbox'
    , max: 10
    });

inbox.on('file', function(file){
  jobs.add(file, function(item){
    var parse = new parser(item)
    parse.on('end', function(order){
      console.log(order);
      jobs.next()
    })
  })
})
