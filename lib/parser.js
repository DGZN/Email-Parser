    var util = require('util'),
          fs = require("fs"),
        lazy = require('lazy'),
     cheerio = require('cheerio'),
       debug = require('debug')('debug:HTML-Parser')
       error = require('debug')('error:HTML-Parser')
     shortid = require('shortid'),
EventEmitter = require('events').EventEmitter;


function Parser(html, cb) {
  if ( ! (this instanceof Parser) )
    return new Parser(html, cb);
  this.parse(html, cb);
}

Parser.prototype.parse = function(html, cb){
  return this.eatTwentyFour(html, cb);
  // if (html.indexOf('email.orderup')>=0) {
  //   this.template = 'email.orderup'
  // }
  // if (html.indexOf('eat24hours.com')>=0) {
  //   this.template = 'eat24'
  // }
  // if (html.indexOf('grubhub.com')>=0) {
  //   this.template = 'grubhub'
  // }
  // switch (this.template || '') {
  //   case 'eat24':
  //     this.eatTwentyFour(html, cb)
  //     break;
  // }
}

Parser.prototype.eatTwentyFour = function(body, cb){
  this.html = body.toString();
  var details = this.html.split('fax')
  if (details[1]) {
    var order = details[1].match(/(click)[\s\S]+(#)$/gmi)
    if (order) {
      return cb(order[0])
    } else {
      return cb(details[1])
    }
  }
}

// var wstream = fs.createWriteStream(__dirname + '/orders/order-'+shortid.generate()+'.txt');
// wstream.on('finish', function () {
//   next()
// });
// wstream.write(order);
// wstream.end();

util.inherits(Parser, EventEmitter);
module.exports = Parser;
