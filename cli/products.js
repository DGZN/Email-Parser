const db      = require('../db');
const request = require("request");
const info    = require("debug")('info:Email-Parser');
const debug   = require("debug")('debug:Email-Parser');
const error   = require("debug")('errors:Email-Parser');
const cheerio = require("cheerio");
const Lazy    = require('lazy');
const Detail  = require('../models/orderdetails');

const START = 0;
const LIMIT = 10000;

var parser   = new Lazy;
var products = new Lazy;
var matched  = [];
var parsed = 0;

products.map((product) => {
  debug(product.name)
})

parser.map((item) => {
  if (item.indexOf('discount')>=0)
    return;
  if (item.indexOf('REMOVED')>=0)
    return;
  if (item.indexOf('ADDED')>=0)
    return;
  if (item.indexOf('UPDATED')>=0)
    return;
  if (item.indexOf('Adjustment')>=0)
    return;
  return item
    .split('Add').join(',')
    .split('Choice').join(', Choice')
    .split('Make').join(', Make')
    .split(/Cook\s/).join(', Cook ')
    .split('Flavor').join(', Flavor')
    .split('Instructions').join(', Instructions')
    .split('Extra Toppings').join(', Extra Toppings')
    .replace(/\sExtra[^\)][\s\S]+:/g,', $1')
    .replace(/\w+\s(Style)+:/g,', $1')
    .replace(/For:[\s\S]+(\dx\s)/,'')
    .split(/(\$\d+.\d+)\s$/g).join(',')
    .split(',')
})
.filter(function (items){
  if (!items) {
    error('no match')
    return;
  }
  items = items.filter((line) => {
    if (line.length>1)
      return line.replace(/^(\s)+/g,'').replace(/\d+x\s/,'');
  })
  var price = items.pop().match(/\$\d*\.*\d*/g)[0];
  var product = {name: '', price: price, details: []}
  var i = 0;
  items.map((line) => {
    if (line.length>1 && line.indexOf('Instructions')==-1)
      var line = line.replace(/^(\s)+/,'').replace(/\d+x\s/,'');
      if (i++==0) {
        product.name = line.trim(' ').replace('***','').replace(/(\d)$/,'')
      } else {
        product.details.push(line)
      }
  })
  if (matched.indexOf(product.name)==-1) {
    matched.push(product.name)
    products.emit('data', product)
  }
})

Detail.find(function(err, orders) {
  if (err)
    throw err;
  orders.map((item) => {
    item.order.items.map((product) => {
      if(product.match(/(\$\d.\d*\s)$/gm))
        return parser.emit('data', product)
      error(product.match(/(\$)/))
    })
  })
}).limit(LIMIT).skip(START);
