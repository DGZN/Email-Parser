var lazy = require("lazy"),
 cheerio = require('cheerio'),
      fs = require("fs");

var matched = false
var body = ''
var parser = new lazy(fs.createReadStream('./inbox/msg-16676-body.txt'))
  .lines
  .forEach(function(line){
    if (line.indexOf('Click Here to confirm this order')>=0)
      matched = true
    if (matched) {
      body += line
    }
  })
  .on('pipe', function() {
    $ = cheerio.load(require('util').inspect(body, { depth: null }))
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
    fs.writeFile('./orders/order-1.txt', order, 'utf8');
    console.log(order);
  })
