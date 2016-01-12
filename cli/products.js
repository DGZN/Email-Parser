const db      = require('../db');
const request = require("request");
const info    = require("debug")('info:Email-Parser');
const debug   = require("debug")('debug:Email-Parser');
const error   = require("debug")('errors:Email-Parser');
const cheerio = require("cheerio");
const Lazy    = require('lazy');
const Detail  = require('../models/orderdetails');

const LIMIT = 10;

var parser = new Lazy;
parser.map((item) => {
  return item
    .split('Add').join(',')
    .split('Choice').join(', Choice')
    .split('Choice').join(', Choice')
    .split('Make').join(', Make')
    .split('Cook').join(', Cook')
    .split('Instructions').join(', Instructions')
    .split('Extra Toppings').join(', Extra Toppings')
    .split(/(\$\d+.\d+)\s$/g).join(',')
    .split(',')

})
.map(function (items) {
  items.map((item) => {
    if (item.length>1 && item.indexOf('Instructions')==-1)
      var extras = item.match(/(Extra)\s*\w*:/,', ');
      if (extras) {
        var item = item.split(/(Extra)\s*\w*:/)
        process.exit()
      }
      debug(item.replace(/^(\s)+/,'').replace(/\d+x\s/,''))
  })
  debug('                                                                                           ')
})

Detail.find(function(err, orders) {
  if (err)
    throw err;
  orders.map((item) => {
    item.order.items.map((product) => {
      parser.emit('data', product)
    })
  })
}).limit(LIMIT);
