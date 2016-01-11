const db      = require('../db');
const _extra  = require('debug')('extra:cli');
const info    = require('debug')('info:cli');
const debug   = require('debug')('debug:cli');
const error   = require('debug')('errors:cli');
const lazy    = require('lazy');
const Order   = require('../models/order');
const Product = require('../models/product');

const LIMIT = 10000;

var parser = new lazy;

parser.forEach(function(product){
  product.extras = matches(product.data)
  product.save(function(err){
    if (err)
      error('Error saving product ['+product.name+'] ' + err)
    debug('Saved product ['+product.name+']')
  })
  info({
    name: product.name
    // , data: product.data
    , extras: product.extras
  })
})

Product.find(function(err, products) {
  if (err)
    throw err;
  products.map((product) => {
    parser.emit('data', product)
  })
}).limit(LIMIT);

parser.on('pipe', function() {
  debug('==--- END ---==')
})

function matches(data){
  var extras = data.match(/([\s\w\D][^:]+\s+(\(\$\d{1,3}.\d{1,2}\s\w+\)))/g)
  if (extras) {
    extras = extras[0].split(',')
    return extras.map((extra) => {
      return extra.trim().replace(/(:\s+)/,'');
    })
  }
  return [];
}
