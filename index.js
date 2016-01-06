var walker = require('./walker'),
    queue  = require('./queue'),
    jobs = new queue({max: 1}),
    orders = new walker({
      dir: __dirname + '/inbox'
    , max: 10
    });
orders.on('file', function(file){
  jobs.add(file)
})
