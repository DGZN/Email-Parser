const db      = require('../db');
const request = require("request");
const info    = require("debug")('info:Email-Parser');
const debug   = require("debug")('debug:Email-Parser');
const error   = require("debug")('errors:Email-Parser');
const cheerio = require("cheerio");
const Lazy    = require('lazy');
const Email   = require('../models/email');
const Detail  = require('../models/orderdetails');

const canceled = require("debug")('orders:canceled');
const future   = require("debug")('orders:future-order');

const ProdctParser = require('../lib/ProductParser');
const HTMLParser   = require('../lib/HTMLParser');

const LIMIT = 10000;

var emails  = new Lazy;
var order   = new Lazy;

var orderDetails = new Lazy;

var parsed = 0;

order.forEach(function(order){
  var parse = new ProdctParser(order.data, function(order){
    if (order) {
      if (order.raw.indexOf('Rebellion')==-1) {
        debug('Success: '+ordersParsed++)
        return error('no match for Rebellion')
      }
    }
  })
})

const RESTAURANT = 'The Rebellion'

var ORDERCODE;
var ORDERDATE;
var ORDERTYPE;
var CUSTOMERPHONE;
var CUSTOMERADDRESS;
var CUSTOMERNAME;

var ORDERTOTAL;
var ORDERITEMS = [];
var ORDERBILL  = [];

var emailsRead = 0;
var failed = 0;

emails.forEach(function(email){
    var $ = cheerio.load(email.html.replace(/<br><b>/g,' '))
    TABLE = email.html
    var table = $('table').text()
    var table = table.split('Item')

    var details = table[0].replace(/^(\s)+(\s)$/gm,'');
    var details = getOrderCode(details);
    var details = getDate(details)
    var details = getType(details);
    var details = getPhone(details);

    var receipt = table[1].replace(/^(\s)+(\s)$/gm,'');

    getItems(receipt);
    emailsRead++;


    switch (ORDERTYPE) {
      case 'Pickup':
        CUSTOMERADDRESS = 'Pickup'
        break;
      case 'FUTURE':
        canceled('[FUTURE]' + email.subject)
        CUSTOMERADDRESS = 'Future'
        break;
      default:
        var details = getAddress(details);
    }

    getName(details)

    if (ORDERITEMS.length) {
      var order = {
        code: ORDERCODE
      , date: ORDERDATE
      , type: ORDERTYPE
      , customer: {
          name:    CUSTOMERNAME
        , phone:   CUSTOMERPHONE
        , address: CUSTOMERADDRESS
        }
      , order: {
          total:   ORDERTOTAL
        , items:   ORDERITEMS
        , receipt: ORDERBILL
        }
      }

      debug(emailsRead)
      orderDetails.emit('data', order)

    } else {
      error(failed++ + '/' + emailsRead)
    }

    CUSTOMERADDRESS = '';
    ORDERITEMS      = [];

})

emails.on('pipe', () => {
  debug('EMAILS ARE DONE')
})

orderDetails.forEach(function(order){
  new Detail(order).save((err) => {
    if (err)
      return error('Unable to save order details to storage ' + err)
    debug(order.code + '  saved to storage');
  })
})

Email.find(function(err, docs) {
  if (err)
    throw err;
  docs.map((email) => {
    var body = email.body.split('Item')[1];
    if (body) {
      emails.emit('data', email)
    } else {
      canceled('[CANCELED]' + email.subject)
    }
  })
}).limit(LIMIT);

function getType(data){
  data = data.split('\n').filter((line,i) => {
    var match = line.match(/(Delivery|Pick-up|Pickup|Future)/gmi)
    if (match) {
      var data = match[0].replace(/^(\s)+(\s)$/gm,'')
      ORDERTYPE = match[0];
    } else {
      return line;
    }
  })
  return data.join('\n');
}

function getOrderCode(data){
  data = data.split('\n').filter((line,i) => {
    var match = line.match(/(\w)+\d{3,}-\d{3,}/i)
    if (!match)
      return line;
    ORDERCODE = match[0];
  })
  return data.join('\n');
}

function getDate(data){
  data = data.split('\n').filter((line,i) => {
    var match = line.match(/(\d+\/\d+\/\d+)/)
    if (match) {
      ORDERDATE = match[0];
    } else {
      var match = line.match(/\w+\s\d+,\s\d+\s\d+:\d+/)
      if (!match)
        return line;
      ORDERDATE = match[0];
    }
  })
  return data.join('\n');
}

function getPhone(data){
  data = data.split('\n').filter((line,i) => {
    var match = line.match(/(\(\d+\)\s\d+-\d+)|(\d{7,})/)
    if (!match)
      return line;
    CUSTOMERPHONE = match[0];
  })
  return data.join('\n');
}

function getAddress(data){
  var matched = 0;
  var matching = false;
  data = data.split('\n').reverse().filter((line,i) => {
    var match = line.match(/\w{3,},\s\d{5},\s\w{2}/)
    if (match)
      matching = true;
    if (matching) {
      matched++;
      if (line.indexOf(RESTAURANT)>0)
        return line;
      if (line.indexOf('For')>=0 || line.indexOf('To')>=0)
        return line;
      if (matched>2 && ! line.match(/\d/))
        return line;
      CUSTOMERADDRESS += '\n' + line.replace(/^(\s)+/,'');
    } else {
      return line;
    }
  })
  if (CUSTOMERADDRESS)
    CUSTOMERADDRESS = CUSTOMERADDRESS.split('\n').reverse().join('\n');
  return data.reverse().join('\n');
}

function getName(data){
  var name = '';
  data = data.split('\n').filter((line,i) => {
    if (line.indexOf('To')>=0) return;
    if (line.indexOf('For')>=0) return;
    if (line.indexOf('Qty')>=0) return;
    if (line.indexOf('ASAP')>=0) return;
    if (line.indexOf(RESTAURANT)>=0) return;
    name += line + '\n'
  })
  if (name)
    CUSTOMERNAME = name.split('\n')[0].replace(/^(\s)+/,'');
}

function getItems(data){
  var items = [];
  var _data = data;
  var match = data.split('Price');
  if (match[1]) {
    var product = '';
    var data = match[1].replace(/^(\s)+/gm,'');
    data.split('\n').filter((line, i) => {
      if (line.indexOf('Price')-1)
        product+=line+' '
      if (line[0]=='$') {
        ORDERITEMS.push(product.replace(/\s{2,}/g,' ').replace('Price ',''))
        product = '';
      }
    })
  }
  if (ORDERITEMS.length < 1) {
    var product = '';
    match[1].split('\n').filter((line, i) => {
      line = line.replace(/^(\s)+/ig,'');
      if (line.length)
        product+=line+' '
      if (line[0]=='$') {
        ORDERITEMS.push(product.replace(/\s{2,}/g,' ').replace('Price ',''))
        product = '';
      }
    })
  }
  if (ORDERITEMS.length<3) {
    var product = '';
    var data = match[1].replace(/^(\s)+/gm,'')
    data.split('\r').filter((line, i) => {
      if (line.length)
        product+=line+' '
      if (line[0]=='$') {
        ORDERITEMS.push(product.replace(/\s{2,}/g,' ').replace('Price ',''))
        product = '';
      }
    })
  }

  var items = ORDERITEMS;
  ORDERITEMS = [];
  var matched = false;
  ORDERBILL = items.filter((item, i) => {
    if (item.indexOf('CASH')>=0)
      matched = true;
    if (item.indexOf('PREPAID')>=0)
      matched = true;
    if (matched)
      return item;
    ORDERITEMS.push(item)
  })
  return null;
}
