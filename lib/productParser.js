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

ProductParser.prototype.parse = function(data, cb){
  var order = {raw: data}
  var parser = new lazy;
  parser.forEach(function(body){
    var details = body.match(/(The Rebellion)[\s\S]+(Qty)/gmi)
    if (details) {
      order['details']  = matchDetails(details);
      order['items']    = matchItems(body);
      order['products'] = matchProducts(matchItems(body));
      order['total']    = matchTotal(body)
      return cb(order)
    } else {
      debug('no matches for ' + body)
      error('no matching results for ' + data.path)
      return cb(null)
    }
  })
  parser.on('pipe', function() {
    debug('==--- END ---==')
  })
  parser.emit('data', data.data)
}

function matchDetails(data){
  var data = data[0].replace('Qty','');
  var data = data.split('ASAP')
  return data[1].trim()
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
        product.push(line.replace(/(Â)/gmi,'').trim());
    } else {
      product.push(line.replace(/(Â)/gmi,'').trim());
      var _product = product.join(' ');
      if (_product.length && _product.length > 6)
        products.push(_product);
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
