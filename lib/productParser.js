    var util = require('util'),
          fs = require("fs"),
        lazy = require('lazy'),
       debug = require('debug')('debug:Product-Parser'),
       debug = require('debug')('debug:Product-Parser'),
       error = require('debug')('errors:Product-Parser'),
     cheerio = require('cheerio'),
     shortid = require('shortid'),
EventEmitter = require('events').EventEmitter;


function ProductParser(body, cb) {
  if ( ! (this instanceof ProductParser) )
    return new ProductParser(body, cb);
  this.parse(body, cb)
}

var failed = 0;

ProductParser.prototype.parse = function(item, cb){
  var order = {}
  var parser = new lazy;
  parser.forEach(function(body){
    var data = body.match(/(The Rebellion)[\s\S]+(Qty)/gmi)
    if (data) {
      var details = matchDetails(data);
      if (details) {
        order['details'] = details;
        order['items']   = matchProducts(matchItems(body));
        order['total']   = matchTotal(body)
        order['raw']     = body
        return cb(order)
      } else {
        debug('Failed: '+failed++)
        return cb(null)
      }
    } else {
      debug('Failed: '+failed++)
      return cb(null)
    }
  })
  parser.on('pipe', function() {
    debug('==--- END ---==')
  })
  parser.emit('data', item)
}

function matchDetails(data){
  if (!data[0])
    return;
  var data = data[0].replace('Qty','');
  var ASAP = data.indexOf('ASAP');
  var FOR = data.indexOf('For');
  if (ASAP < FOR) {
    var data = data.replace('Â ','').split('ASAP')
    var _data = data[0].split('\n')
  } else {
    var _data = data.split('\n')
  }
  if (_data[6] !== 'Delivery' && _data[6] !== 'Pickup') {
    if (data.indexOf('VIP Customer')>=0) {
      delete _data[_data.indexOf('VIP Customer')]
    }
  }
  if (_data[6] !== 'Delivery' && _data[6] !== 'Pickup')
    return false;
  return {
    type: _data[6]
    , customer: {
      name: _data[4]
      , phone: _data[7].replace('Phone: ','')
      , address: _data[8].replace('Address: ','') + ' ' + _data[12]
    }
    , instructions: _data[9]
  }
}

function matchItems(data){
  var items = data.split('Price')[1];
  if (items.match('CONFIRM')) {
    items = items.split('CONFIRM')[0];
  }
  if (items.match('--')) {
    items = items.split('--')[0];
  }
  return items;
}

function matchProducts(data){
  var products = [];
  var product = [];
  var finished = 0;
  data.split('\n').forEach(function(line){
    if (finished)
      return;
    if (line.indexOf('END OF ORDER')>=0)
      finished = true;
    if (line.indexOf('PREPAID')>=0)
      finished = true;
    if (line && line[0]!='$') {
        product.push(line.replace(/(Â)/gmi,''));
    } else {
      product.push(line.replace(/(Â)/gmi,''));
      var _product = product.join(' ');
      if (_product.length && _product.length > 6)
        products.push(_product.replace(/^(\s)+/g,''));
      product = [];
    }
  })
  if (!products.length)
    error('No matching products')
  return products;
}

function matchTotal(data){
  var total = data.match(/\s(TOTAL)\s[$]+[\d]+[.][\d]+/m)
  if (total)
    return total[0].replace('TOTAL','').trim()
}

util.inherits(ProductParser, EventEmitter);
module.exports = ProductParser;
