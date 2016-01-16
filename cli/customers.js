const db      = require('../db');
const request = require("request");
const info    = require("debug")('info:Email-Parser');
const debug   = require("debug")('debug:Email-Parser');
const error   = require("debug")('errors:Email-Parser');
const cheerio = require("cheerio");
const Lazy    = require('lazy');
const Detail  = require('../models/orderdetails');

const LIMIT = 1000;

var customers = [];

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
      var customer = {
        name:   item.customer.name
      , phone:  item.customer.phone
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
  for (var i in customers) {
    debug(customers[i].name + ' : ' + customers[i].phone)
  }
}).limit(1000);
