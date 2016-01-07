var debug = require('debug')('test:email-parsing'),
    error = require('debug')('test:email-parsing:error'),
       fs = require("fs"),
     lazy = require('lazy'),
  cheerio = require('cheerio'),
   parser = require('../lib/parser');

const FILE = '/Users/kylewilliams/dgzn/Email-Parser/inbox/msg-1002-body.txt'

parser.prototype.parse = function(file){
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
  .forEach(function(body){
    switch (self.template || '') {
      case 'eat24':
        self.eatTwentyFour(body)
        break;
    }
  })
  .on('pipe', function() {
    switch (self.template || '') {
      case 'eat24':
        if (self.body) {
          $ = cheerio.load(require('util').inspect(self.body, { depth: null }))
          var order = $('table:nth-child(5)').text()
            .replace(/(\\r)/g,' ')
            .replace(/(=20)/g,' ')
            .replace(/(=)/g,' ')
            .replace(/(C2A0)/gi,' ')
            // .replace(/^\s+/gi, ' ')
            .replace(/(Make)/gi, ' Make')
            .replace(/(Extra\))/gi, 'Extra) ')
            .replace(/(Choice)/gi, ' Choice')
            .replace(/(\s)+/g, ' ')
            .replace(/(\d+[x])/gm, "\r\n $1")
            .replace(')(',') ( ')
            .replace(/(0D)/gi, ' ')
            .replace('Qty Item Price', ' Qty Item Price \r\n --- ---- -----')
          if (order)
            return self.emit('end', order)
          return self.emit('end', null)
        }
        break;
    }
  })
}

parser.prototype.eatTwentyFour = function(body){
  if (body)
    debug(body.toString())
  // if (line.toString().replace(/(=0D)/gmi, '').indexOf('Click Here to confirm this order')>=0)
  //   this.matched = true
  // if (this.matched)
  //   this.body += line
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
