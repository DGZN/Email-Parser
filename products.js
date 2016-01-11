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

var rs = new Readable({
  objectMode: true
});

rs._read = function () {};

rs.on('data', function(item){
  new Order(item).save(function(err){
    if (err)
      error('Error saving order to storage ' + err)
    debug('Saved one order to storage')
  });
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

parser.forEach(function(item){
  var parse = new ProdctParser(item.body, function(order){
    if (order) {
      parsed++;
      if (order.raw.indexOf('Rebellion')==-1)
        return error('no match for Rebellion')
      if (order.items.length) {
        rs.push({
          details: order.details
          , items:   order.items
          , raw:     order.raw
        })
      } else {
        error(order.raw)
      }
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
    parsed++;
    if (_files.length && parsed < maxReads)
      return readFile()
    info('Finished processing ' + parsed + ' files')
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
