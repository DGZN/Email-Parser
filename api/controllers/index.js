var express = require('express');
var router = express.Router();
var db = require('../db');
var Details = require('../models/orderdetails');
var Product = require('../models/product');


router.get('/', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.render('index', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(100).select('-_id -__v');
});

router.get('/customers', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.render('customers', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(10000).select('-_id -__v');
});


router.get('/products', function(req, res, next) {
  var distinct = [];
  Product.find(function(err, products) {
    if (err)
      throw err;
    products.map((item) => {
      if (distinct.indexOf(item.name)==-1)
        if (item && item.price[0] == '$') {
          distinct.push({
            name:   item.name
          , price:  item.price
          , extras: item.extras
          , data:   item.data
          })
        }
    })
    res.render('products', { title: 'Rebellion Products', products:  distinct});
  });
});

router.get('/map', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.render('map', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(100).select('-_id -__v');
});

module.exports = router;
