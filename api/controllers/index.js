var express = require('express');
var router = express.Router();
var db = require('../db');
var Detail = require('../models/orderdetails');
var Product = require('../models/orderproducts');
var Customer = require('../models/customer');


router.get('/', function(req, res, next) {
  Detail.find(function(err, orders) {
    if (err)
      throw err;
    res.render('index', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(250).select('-_id -__v');
});

router.get('/products', function(req, res, next) {
  Product.find(function(err, products) {
    if (err)
      throw err;
    res.render('products', { title: 'Rebellion Products', products:  products});
  }).sort({price: -1});
});

router.get('/map', function(req, res, next) {
  Detail.find(function(err, orders) {
    if (err)
      throw err;
    res.render('map', { title: 'The Rebellion', orders: orders});
  }).sort({date: -1}).limit(100).select('-_id -__v');
});

router.get('/customers', function(req, res, next) {
  Customer.find(function(err, customers) {
    if (err)
      throw err;
    var _customers = [];
    customers.map(function(customer){
      if (customer.name.indexOf('Josh Kranzler')>=0) {
        customer.name  = 'Keiichi Lindley';
        customer.phone = 7202660754
        customer.address = '4731 S Bannock St, Englewood CO 80110'
      }
      _customers.push(customer)
    })
    res.render('customers', { title: 'The Rebellion', customers: _customers });
  }).limit(1000).select('-_id -__v');
});

router.get('/search', function(req, res, next) {
  res.render('search', { title: 'The Rebellion'});
});

module.exports = router;
