const db        = require('../db');
const request   = require("request");
const info      = require("debug")('info:Email-Parser');
const debug     = require("debug")('debug:Email-Parser');
const error     = require("debug")('errors:Email-Parser');
const cheerio   = require("cheerio");
const Lazy      = require('lazy');
const Products  = require('../models/orderproducts');

const LIMIT = 1;

var Items  = new Lazy;
var Extras = new Lazy;

Items.forEach((product) => {
  var types = [];
  var values = product.item.split(':');
  if (values.length==1) {
    debug(values)
  }
})

Extras.forEach((product) => {
  debug('# '+product.name)
  product.details.map((item) => {
    Items.emit('data', {
      item: item[0]
    , name: product.name
    })
  })
})

Products.find(function(err, products) {
  if (err)
    throw err;
  products.map((product) => {
    Extras.emit('data', product)
  })
}).limit(LIMIT);
