
var express = require('express'),
     router = express.Router(),
         db = require('../db')

var User = require('../models/user');
var Product = require('../models/product');
var Order   = require('../models/order');

router.get('/users', function(req, res, next) {
  User.find(function(err, users) {
    if (err)
      throw err;
    res.send(users);
  });
});

router.get('/products', function(req, res, next) {
  Product.find(function(err, products) {
    if (err)
      throw err;
    res.send(products);
  }).select('data -_id');
});

router.get('/orders', function(req, res, next) {
  Order.find(function(err, orders) {
    if (err)
      throw err;
    res.send(orders);
  }).select('details items total -_id');
});


module.exports = router;
