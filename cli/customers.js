const db      = require('../db');
const request = require("request");
const info    = require("debug")('info:Email-Parser');
const debug   = require("debug")('debug:Email-Parser');
const error   = require("debug")('errors:Email-Parser');
const cheerio = require("cheerio");
const Lazy    = require('lazy');
const Detail  = require('../models/orderdetails');

const LIMIT = 1;

var customers = [];

Detail.find(function(err, orders) {
  if (err)
    throw err;
  orders.map((item) => {
    if (item.customer.address!=='Pickup') {
      var address = item.customer.address.split('\n').join(' ')
      var customer = {
        name:   item.customer.name
      , phone:  item.customer.phone
      , orders: [item.order]
      }
      if (Object.keys(customers).indexOf(address)>=0) {
        customers[address].orders.push(order);
      } else {
        customers[address] = customer;
      }
    }
  })
}).limit(LIMIT);


//
