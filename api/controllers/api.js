
var express = require('express'),
     router = express.Router(),
         db = require('../db')

var User = require('../models/user');
var Order    = require('../models/order');
var Details  = require('../models/orderdetails');
var Product  = require('../models/productgrouped');
var Customer = require('../models/customer');
var Email    = require('../models/email');

router.get('/users', function(req, res, next){
  User.find(function(err, users){
    if (err)
      throw err;
    res.send(users);
  });
});

router.get('/products', function(req, res, next){
  var distinct = [];
  Product.find(function(err, products){
    if (err)
      throw err;
    res.send(products);
  }).sort({price: -1}).select('-__v -_id -options.Instructions');
});

router.get('/orders', function(req, res, next){
  Details.find(function(err, orders){
    if (err)
      throw err;
    res.send({
      count: orders.length
    , data: orders
    });
  }).sort({date: -1}).limit(1000).select('-_id -__v');
});

router.get('/emails', function(req, res, next){
  Email.find(function(err, emails){
    if (err)
      throw err;
    res.send(emails);
  }).limit(500).select('file body raw -_id');
});


router.get('/customers', function(req, res, next){
  Customer.find(function(err, customers){
    if (err)
      throw err;
    res.send(customers)
  }).limit(1000).select('-orders -_id -__v');
});

router.get('/search/customers', function(req, res, next) {
  if (req.query.name) {
    var query = {
      name: { $regex :  new RegExp(req.query.name, "i")}
    }
  } else {
    var query = {
      phone: { $regex :  new RegExp(req.query.phone, "i")}
    }
  }
  Customer.find(query, function(err, customer){
    if (err)
      throw err;
    res.send(customer)
  }).select('-_id -__v')
});

module.exports = router;
