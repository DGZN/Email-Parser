var express = require('express');
var router = express.Router();
var db = require('../db');
var Details = require('../models/orderdetails');
var Product = require('../models/orderproducts');


router.get('/', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.render('index', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(250).select('-_id -__v');
});

router.get('/customers', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.render('customers', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(10000).select('-_id -__v');
});


router.get('/products', function(req, res, next) {
  Product.find(function(err, products) {
    if (err)
      throw err;
    res.render('products', { title: 'Rebellion Products', products:  products});
  }).sort({price: -1});
});

router.get('/map', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.render('map', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(100).select('-_id -__v');
});

module.exports = router;
