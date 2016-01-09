const fs     = require('fs');
const db     = require('./db');
const util   = require('util');
const stream = require('stream');
const info   = require('debug')('info:Products');
const debug  = require('debug')('debug:Products');
const error  = require('debug')('errors:Products');
const lazy   = require('lazy');
const walker = require('./lib/walker');
const Readable     = require('stream').Readable;
const ProdctParser = require('./lib/ProductParser');

const maxReads = 10000;
const Order = require('./models/order');
const Product = require('./models/product');

var _files  = [];
var products = [];

var rs = new Readable({
  objectMode: true
});

rs._read = function () {};

rs.on('data', function(item){
  debug('Storing: ' + item.order.products.length + ' products')
  var productString = ''
  var order = new Order({
    file:    item.order.raw.path
  , data:    item.order.raw.data
  , items:   item.order.products
  , total:   item.order.total
  , details: item.details
  })
  order.save(function(err){
    if (err)
      error('Error saving order to storage ' + err)
    debug('Saved one order to storage')
  });
  item.order.products.map((item) => {
    info(item)
    var product = new Product({
      data: item
    });
    product.save(function(err){
      if (err)
        error('Error saving product to storage ' + err)
    });
  })
})

fs.readdir('./orders/', function(err, files){
  if (err)
    throw err;
  _files = files;
  debug('Found ' + files.length + ' files')
  readFile();
})

var parser = new lazy;
var parsed = 0;

parser.forEach(function(product){
  var parse = new ProdctParser(product, function(order){
    if (order) {
      if (order.details.indexOf('Rebellion')==-1)
        error('no match for Rebellion')
      info('Details: ' + order.details)
      info('Products: ' + order.products)
      order.products.forEach((product) => {
        info(product)
      })
      products.push({
        path:  product.path
      , order: order
      })
      rs.push({
        path:  product.path
      , order: order
      , details: order.details
      })
      parsed++;
    }
  })
})

parser.on('pipe', function() {
  debug('Finished parsing ' + parsed + ' products')
})

function readFile(){
  fs.readFile('./orders/'+_files[0], (err, data) => {
    if (err)
      throw err;
    if (data.toString().length < 1)
      error(_files[0] + ' is empty')
    parser.emit('data', {
      path: _files[0]
    , data: data.toString()
    })
    _files.shift();
    if (_files.length && products.length < maxReads)
      return readFile()
    debug('Finished processing ' + products.length + ' files')
  });
}

function writeFile(path, data){
  var path = './orders/'+path.replace('msg', 'order');
  fs.writeFile(path, data, (err) => {
    if (err)
      return error('Error writing to ' + path)
    debug('Saved order to ' + path)
  });
}