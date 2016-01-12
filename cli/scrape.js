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
  var products = [];
  var data = []
  html.split('\n').map((line, i) => {
    if (line.replace(/(\s)+/gm,'').length>0) {
      var line = line.replace(/(\s)+/gm,' ');
      var line = line.replace(/^(\s)+/g,'');
      if (line[0]=='$') {
        products.push({
          name:  data.join(' ')
        , price: line
        })
        data=[]
      } else {
        data.push(line.replace(/^(\s)+/g,''))
      }
    }
    return products[products.length-1]
  })
  products.map((item) => {
    var product = new Product(item)
    product.save((err) => {
      if (err)
        return error('Error saving product ['+product.name+'] to storage ' + err)
      debug('Saved product ['+product.name+'] to storage')
    })
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

/*
  var items = document.getElementsByClassName('item')
  var count=0;
  for (var i in items) {
    if (count>112)
      continue;
    count++
    var item = items[i];
    openModal(item)
  }

  function openModal(item){
    setTimeout(function(){
      item.click()
      console.log("opening " + item)
    }, 150 + (i * 3500))
  }
*/
