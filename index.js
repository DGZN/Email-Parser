var walker = require('./walker'),
    queue  = require('./queue'),
    parser = new queue({max: 1}),
    orders = new walker(__dirname+'/inbox');

orders.on('file', function(file){
  parser.add(file)
})
