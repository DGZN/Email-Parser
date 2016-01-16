var express = require('express');
var router = express.Router();
var db = require('../db');
var Detail = require('../models/orderdetails');
var Product = require('../models/orderproducts');


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
  Detail.find(function(err, orders) {
    if (err)
      throw err;
    var customers = {};
    var sumtotal  = 0;
    orders.filter((item) => {
      if (item.customer.address!=='Pickup') {
        var address = item.customer.address.split('\n').join(' ')
        var total = item.order.receipt[item.order.receipt.length-1].split('$')[1]
        sumtotal+=parseInt(total.trim());
        item.order.date = item.date;
        var customer = {
          name:   item.customer.name
        , phone:  item.customer.phone.replace(/([\(\)])/g,'')
        , address:  item.customer.address
        , total:  total
        , count:  1
        , orders: [item.order]
        }
        console.log(customer);
        if (Object.keys(customers).indexOf(address)>=0) {
          customers[address].orders.push(item.order)
          customers[address].count++
        } else {
          customers[address] = customer
        }
      }
    })
    res.render('customers', { title: 'The Rebellion', customers: customers });
  }).limit(1000);
});

module.exports = router;
