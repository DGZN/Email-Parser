const db      = require('../db');
const request = require("request");
const cheerio = require("cheerio");
const shortid = require('shortid');

const lazy    = require('lazy');
const info    = require("debug")('info:HTML-Scraper');
const debug   = require("debug")('debug:HTML-Scraper');
const error   = require("debug")('errors:HTML-Scraper');

const Product = require('../models/product');

var products = [];
var parser = new lazy

parser.forEach((html) => {
  var data = []
  html.split('\n').map((line) => {
    if (line.replace(/(\s)+/gm,'').length>0) {
      var line = line.replace(/(\s)+/gm,' ');
      data.push(line.replace(/^(\s)+/g,''))
      if (line.replace(' ','')[0]=='$') {
        products.push(data.join('\n'))
        data = [];
        var current = products[products.length-1].split('\n');
        var product = new Product({
          name:  current[0]
        , price: (current.length==3 ? current[2] : current[1])
        })
        if (current.length==3)
          product.desc = current[2];
        product.save(function(err){
          if (err)
            return error('Error saving product ['+product.name+'] to storage ' + err)
          debug('Saved product ['+product.name+'] to storage')
          info(product)
        });
      }
    }
    return products[products.length-1]
  })
  debug('GET: http://denver.eat24hours.com/the-rebellion/24149 [200]')
  debug('Matched: ' + products.length)
})

request({
  uri: "http://denver.eat24hours.com/the-rebellion/24149",
}, function(error, response, body) {
  var $ = cheerio.load(body);
  parser.emit('data', $('table').text())
});
