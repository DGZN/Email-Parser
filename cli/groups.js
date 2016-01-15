const db       = require('../db');
const request  = require("request");
const info     = require("debug")('info:Email-Parser');
const debug    = require("debug")('debug:Email-Parser');
const error    = require("debug")('errors:Email-Parser');
const cheerio  = require("cheerio");
const Lazy     = require('lazy');
const Details  = require('../models/productdetails');
const Grouped  = require('../models/productgrouped');

const LIMIT = 10;

var groups = [];
var terms  = [];

var Products = new Lazy;

Products.forEach((product) => {
  if (Object.keys(terms).indexOf(product.name)==-1) {
    terms.push(product.name);
    terms[product.name] = {
      term: product.name
    , price: product.price
    , items: []
    , options: []
    , self: product.self
    }
    terms[product.name].options.push(product.options)
    if (product.items.length)
      terms[product.name]['items'].push(product.items)
  } else {
    if (product.options && product.options.length)
      terms[product.name].options.push(product.options)
  }
}).on('pipe', () => {
  terms.map((term) => {
    var options = [];
    if (terms[term]) {
      terms[term].items.map((term) => {
        var size = term[0].match(/(large)|(medium)|(small)|(")/gi)
        var qty  = term[0].match(/(\d)/gi)
        if (size) {
          if (Object.keys(options).indexOf('Sizes')==-1) {
            options['Sizes'] = [];
          }
          options['Sizes'].push(term[0])
        } else if (qty) {
          if (Object.keys(options).indexOf('Qty')==-1) {
            options['Qty'] = [];
          }
          options['Qty'].push(term[0])
        } else {
          if (Object.keys(options).indexOf('Other')==-1) {
            options['Other'] = [];
          }
          options['Other'].push(term[0])
        }
      })
      Object.keys(options).map((key) => {
        terms[term].options[key] = options[key]
      })
      var product = {
        name:    term
      , price:   terms[term].price
      , options: terms[term].options
      }
      debug(product)
      // terms[term].self.update(product, (err) => {
      //   if (err)
      //     return error(err)
      //   debug(term + ' updated in database')
      // })
    }
  })
})

Details.find(function(err, items) {
  if (err)
    return error(err)
  items.map((item) => {
    var parts = item.name.split(' (');
    Products.emit('data', {
      name: parts[0]
    , price: item.price
    , items: parts[1] ? ['('+parts[1].trim()] : []
    , options: item.options
    , self: item
    })
  })
  Products.emit('end');
}).limit(LIMIT);
