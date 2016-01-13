const db        = require('../db');
const request   = require("request");
const info      = require("debug")('info:Email-Parser');
const debug     = require("debug")('debug:Email-Parser');
const error     = require("debug")('errors:Email-Parser');
const cheerio   = require("cheerio");
const Lazy      = require('lazy');
const Products  = require('../models/orderproducts');

const LIMIT = 20;

var Options  = new Lazy;
var Extras = new Lazy;

var products = [];

Options.forEach((product) => {
  var values = product.option.split(':');
  if (values.length==2) {
    addOption(product.name, values)
  }
}).on('pipe', () => {
  debug('Finished processing all files')
  console.log(require('util').inspect(products, { depth: null }));
})

Extras.forEach((product) => {
  product.details.map((option) => {
    Options.emit('data', {
      option: option[0]
    , name: product.name
    })
  })
}).on('pipe', () => {
  Options.emit('end')
})

Products.find(function(err, products) {
  if (err)
    return error(err)
  products.map((product) => {
    addProduct(product)
  })
  Extras.emit('end');
}).limit(LIMIT);

function addProduct(product){
  if (Object.keys(products).indexOf(product.name)==-1) {
    products.push(product.name);
    products[product.name] = {
      options: {}
    }
  }
  Extras.emit('data', product)
}

function addOption(name, values){
  var key   = values[0].trim()
  var value = values[1].trim()
  if (typeof products[name].options == 'object') {
    if (Object.keys(products[name]['options']).indexOf(key)==-1) {
      products[name]['options'][key] = [];
      products[name]['options'][key].push(value)
    } else {
      if (products[name]['options'][key].indexOf(value)==-1)
        products[name]['options'][key].push(value)
    }
  }
}
