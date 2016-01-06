    var util = require('util'),
          fs = require("fs"),
        lazy = require('lazy'),
     cheerio = require('cheerio'),
     shortid = require('shortid'),
EventEmitter = require('events').EventEmitter;


function Parser(file) {
  if ( ! (this instanceof Parser) )
    return new Parser(file);
  this.parse(file)
}

Parser.prototype.parse = function(file){
  var self = this;
  var parser = new lazy(fs.createReadStream(file))
    .forEach(function(body){
      if (body) {
        var _body = body.toString()
        if (_body.indexOf('email.orderup')>=0) {
          self.template = 'email.orderup'
        }
        if (_body.indexOf('eat24hours.com')>=0) {
          self.template = 'eat24'
        }
        if (_body.indexOf('grubhub.com')>=0) {
          self.template = 'grubhub'
        }

      }
    })
    .lines
    .forEach(function(line){
      switch (self.template || '') {
        case 'eat24':
          self.eatTwentyFour(line)
          break;
      }
    })
    .on('pipe', function() {
      switch (self.template || '') {
        case 'eat24':
          if (self.body) {
            $ = cheerio.load(require('util').inspect(self.body, { depth: null }))
            var customer = $('table:nth-child(4)').text()
            var order = $('table:nth-child(5)').text()
            .replace(/(\\r)/g,'')
            .replace(/(=20)/g,'')
            .replace(/(=)/g,'')
            .replace(/(C2A0)/gi,'')
            .replace(/\s+/g, ' ')
            .replace(/^\s+/gi, '')
            .replace(/(\d+[x])/gm, "\r\n $1")
            .replace(/^\s+/gi, '')
            .replace(')(',') (')
            .replace('Qty Item Price', ' Qty Item Price \r\n --- ---- -----')
            fs.writeFile('./orders/order-' + shortid.generate() + '.txt', order, 'utf8');
            self.emit('end', order)
          }
          break;
      }

    })

}

Parser.prototype.eatTwentyFour = function(line){
  if (line.indexOf('Click Here to confirm this order')>=0)
    this.matched = true
  if (this.matched) {
    this.body += line
  }
}

util.inherits(Parser, EventEmitter);
module.exports = Parser;
