
var express = require('express'),
     router = express.Router(),
         db = require('../db')

var User = require('../models/user');
var Order    = require('../models/order');
var Details  = require('../models/orderdetails');
var Product  = require('../models/productgrouped');
var Email    = require('../models/email');

router.get('/users', function(req, res, next) {
  User.find(function(err, users) {
    if (err)
      throw err;
    res.send(users);
  });
});

router.get('/products', function(req, res, next) {
  var distinct = [];
  Product.find(function(err, products) {
    if (err)
      throw err;
    res.send(products);
  }).sort({price: -1}).select('-__v -_id -options.Instructions');
});

router.get('/orders', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    res.send({
      count: orders.length
    , data: orders
    });
  }).sort({date: -1}).limit(1000).select('-_id -__v');
});

router.get('/emails', function(req, res, next) {
  Email.find(function(err, emails) {
    if (err)
      throw err;
    res.send(emails);
  }).limit(500).select('file body raw -_id');
});


router.get('/customers', function(req, res, next) {
  Details.find(function(err, orders) {
    if (err)
      throw err;
    var customers = {};
    var sumtotal  = 0;
    orders.filter(function(item){
      if (item.customer.address!=='Pickup') {
        var address = item.customer.address.split('\n').join(' ')
        var total = item.order.receipt[item.order.receipt.length-1].split('$')[1]
        sumtotal+=parseInt(total.trim());
        item.order.date = item.date
        var customer = {
          name:   item.customer.name
        , phone:  item.customer.phone
        , address:  item.customer.address
        , total:  total
        , count:  1
        , orders: [item.order]
        }
        if (Object.keys(customers).indexOf(address)>=0) {
          customers[address].orders.push(item.order)
          customers[address].count++
        } else {
          customers[address] = customer
        }
      }
    })
    res.send({
      total: "$"+sumtotal.toLocaleString('USD')
    , data: customers
    })
  }).limit(1000);
});




module.exports = router;
