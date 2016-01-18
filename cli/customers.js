const db      = require('../db');
const request = require("request");
const info    = require("debug")('info:Email-Parser');
const debug   = require("debug")('debug:Email-Parser');
const error   = require("debug")('errors:Email-Parser');
const cheerio = require("cheerio");
const Lazy    = require('lazy');
const Detail  = require('../models/orderdetails');
const Customer  = require('../models/customer');

const LIMIT = 10000;

var customers = [];

Detail.find(function(err, orders) {
  if (err)
    throw err;
  var customers = {};
  var sumtotal  = 0;
  orders.filter(function(item){
    if (item.customer.address!=='Pickup') {
      if (item.customer.name.indexOf('Instructions')>=0)
        return
      if (item.customer.name.indexOf('street')>=0)
        return
      var address = item.customer.address.split('\n').join(' ')
      var total = item.order.receipt[item.order.receipt.length-1].split('$')[1]
      sumtotal+=parseInt(total.trim());
      item.order.date = item.date
      var customer = {
        name:    item.customer.name.replace(/[^\w]/g,' ').replace(/\s{2,}/g,'')
      , phone:   item.customer.phone.replace(/[^\d]/g,' ').replace(/\s/g,'')
      , address: address
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
    new Customer(customers[i]).save((err, doc) => {
      if (err)
        return error(err)
      debug('['+doc.name+'] saved to storage.')
    })
  }
}).limit(LIMIT);
