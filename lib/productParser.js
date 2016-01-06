    var util = require('util'),
          fs = require("fs"),
        lazy = require('lazy'),
     cheerio = require('cheerio'),
     shortid = require('shortid'),
EventEmitter = require('events').EventEmitter;


function ProductParser(file) {
  if ( ! (this instanceof ProductParser) )
    return new ProductParser(file);
  this.parse(file)
}

ProductParser.prototype.parse = function(file){
  var self = this;
  var subs;
  var parser = new lazy(fs.createReadStream(file))
    .forEach(function(body){

    })
    .lines
    .forEach(function(line){
      if (line.toString().indexOf('Qty')>=0)
        return;
      if (line.toString().indexOf('---')>=0)
        return;
      if (line.toString().indexOf('**')>=0)
        return;
      if (line.toString().indexOf('Choice')) {
        subs = line.toString().split('Choice')
      }
      if (subs[0] && subs[0].indexOf('Cook Style')) {
        subs = subs[0].split('Cook Style')
      }
      if (subs[0] && subs[0].indexOf('Flavor')) {
        subs = subs[0].split('Flavor')
      }
      if (subs[0] && subs[0].indexOf('Add Dipping Sauce')) {
        subs = subs[0].split('Add Dipping Sauce')
      }
      if (subs[0] && subs[0].indexOf('(')) {
        subs = subs[0].split('(')
      }
      if (subs[0] && subs[0].indexOf('Pizza Instructions')) {
        subs = subs[0].split('Pizza Instructions')
      }
      if (subs[0] && subs[0].indexOf('Extra')) {
        subs = subs[0].split('Extra')
      }
      if (subs[0] && subs[0].indexOf('Instructions')) {
        subs = subs[0].split('Instructions')
      }
      if (subs[0] && subs[0].indexOf('Make it')) {
        subs = subs[0].split('Make it')
      }
      if (subs[0] && subs[0].indexOf('Make')) {
        subs = subs[0].split('Make')
      }
    })
    .on('pipe', function() {
      if (!subs)
        return;
      var product = subs[0].replace(/(\d[x]\s)/gi,'')
                           .replace(/(\$\d+.\d+)/gi,'')
                           .replace('Half Pound of ', '')
                           .replace('2 Liters ', '')
      self.emit('product', product)
    })

}

util.inherits(ProductParser, EventEmitter);
module.exports = ProductParser;
