var walker = require('./walker'),
    queue  = require('./queue'),
  products = require('./lib/productParser'),
      jobs = new queue({concurrent: 1}),
    orders = new walker({
      dir: __dirname + '/orders'
    , max: 2500
    });

var _products = []

orders.on('file', function(file){
  jobs.add(file, function(item){
    var parse = new products(item)
    parse.on('product', function(product){
      if (_products.indexOf(product)==-1) {
        console.log(product);
        _products.push(product)
      }
    })
  })
})

orders.on('end', function(){
  console.log('[', _products.length, 'products parsed and validated',']');
})
