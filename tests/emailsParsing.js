var debug = require('debug')('test:email-parsing'),
    error = require('debug')('test:email-parsing:error'),
       fs = require("fs"),
     lazy = require('lazy'),
  cheerio = require('cheerio'),
   parser = require('../lib/parser');

const FILE = './inbox/msg-393-body.txt'

/*
  17327
  2669
  3603
  4818
  5087
  7015
  7494
  8713
  883
  9488
  9999
*/

parser.prototype.parse = function(file){
  var self = this;
  this.order = {};
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
  .forEach(function(body){
    switch (self.template || '') {
      case 'eat24':
        self.eatTwentyFour(body)
        break;
    }
  })
}

parser.prototype.eatTwentyFour = function(body){
  if (!body)
    return error('body-empty');
  this.html = body.toString();
  var details = this.html.split('fax')
  if (details[1]) {
    var _details = details[1].match(/(click)[\s\S]+(#)$/gmi)
    if (_details)
      return debug(_details[0])
    debug(details[1])
  }
}


function parse(file){
  var parse = new parser(file)
  parse.on('end', function(order){
    if (!order)
      return error('order is null or empty')
    return debug(order)
  })
}

parse(FILE)
