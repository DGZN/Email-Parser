const fs     = require('fs');
const util   = require('util');
const stream = require('stream');
const read   = require('stream').Readable;
const info   = require('debug')('info:Read-Stream');
const debug  = require('debug')('debug:Read-Stream');
const error  = require('debug')('errors:Read-Stream');
const lazy   = require('lazy');
const walker = require('./lib/walker');
const HTMLParser = require('./lib/parser');

const maxReads = 10000;

var _files  = [];
var orders = [];

fs.readdir('./inbox/', function(err, files){
  if (err)
    throw err;
  _files = files;
  debug('Found ' + _files.length + ' files')
  readFile();
})

var parser = new lazy;
parser.forEach(function(order){
  debug(order.path + ' ' + order.data.length)
  var parse = new HTMLParser(order.data, function(data){
    if (!data)
      error(data)
    debug('Matched ' + order.path)
    if (data.indexOf('Rebellion')==-1)
      error('no match for Rebellion')
    info(data)
    orders.push({
      path:  order.path
    , order: data
    })
    //writeFile(order.path, data)
  })
})

function readFile(){
  fs.readFile('./inbox/'+_files[0], (err, data) => {
    if (err)
      throw err;
    if (data.toString().length < 1)
      error(_files[0] + ' is empty')
    else
      debug(_files[0] + ' has ' + data.toString().length + ' chars')
    parser.emit('data', {
      path: _files[0]
    , data: data.toString()
    })
    _files.shift();
    if (_files.length && orders.length < maxReads)
      return readFile()
    else
      debug('Finished processing ' + orders.length + ' files')
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
