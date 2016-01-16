var http   = require('http')
  , qs     = require('querystring')
  , twilio = require('twilio')
  , debug  = require('debug')('debug:server')

var callerID = false;

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function(){
    if (!callerID) {
      console.log(require('util').inspect(qs.parse(body), { depth: null }));
      callerID = true;
    }
    handleCall(req.url, res, qs.parse(body))
  });
}).listen(8181, '0.0.0.0').on('request', (req) => {
  console.log(req.url + '  <---');
})

function handleCall(url, res, data){
  if (data['Digits']) {
    debug('Input Digits: ' + data['Digits'])
  }
  if (data['From'])
    debug('Call from ' + data['From'].replace(/\*/,''))
  if (url == '/confirmation') {
    return res.end(OrderConfirmation())
  }
  if (url == '/billingInfo') {
    return res.end(ConfirmBillingInfo())
  }
  if (url == '/deliveryMethod') {
    return res.end(DeliveryMethod())
  }
  if (url == '/checkout') {
    return res.end(Checkout())
  }
  if (!data['msg']) {
    res.end(Greeting(data['From']))
  } else {
    if (data['Digits'] == '1')
      return res.end(RecentOrders())
    return res.end(Menu())
  }
}

function Greeting(caller){
  if (caller.indexOf('7202660754')>=0) {
    var name = 'Keiichi Lindley';
  } else {
    var name = 'Brent Fox';
  }
  var twiml = new twilio.TwimlResponse();
  twiml.say('Welcome back ' + name)
  .pause(10)
  .say('Thank you for calling The Rebellion')
  .pause(10)
  .say('Please hold to place your order')
  .pause(10)
  .gather({
    action:'/order',
    finishOnKey:'#'
  }, function() {
    this.say('Please choose from one of the following options')
    .pause(10)
    .say('Press 1 to order from your recent history')
    .pause(10)
    .say('Press 2 to hear a menu')
    .pause(10)
    .say('Press 3 to talk to a person', {
      voice:'woman'
    , language: 'en-gb'
    })
  });
  return twiml.toString();
}

function Menu(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Please select from one of the following options')
  .pause(10)
  .gather({
    action:'/selection',
    finishOnKey:'#'
  }, function() {
    this.say('Press 1 to hear popular items')
    .pause(10)
    .say('Press 2 to hear Vegan only menu items')
    .pause(10)
    .say('Press 3 to order a hamburger', {
      voice:'woman'
    })
  });
  return twiml.toString();
}

function RecentOrders(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Please select from one of your recent orders')
  .pause(10)
  .gather({
    action:'/confirmation',
    finishOnKey:'#'
  }, function() {
    this.say('Press 1 for')
    this.say('1 Grilled Meat Salad (Large). Choice of Dressing: Ranch. Make it with: Buffalo. Instructions: No onions. Total price: $8.99')
    .pause(20)
    .say('Press 2 for')
    .say('1 Appetizer Sampler. Choice of Samplers: Jalapeno Poppers, Macaroni Bites and Onion Rings. Choice of Dipping Sauce: Ranch. Total price: $6.99')
    .pause(20)
    .say('Press 3 hear that again.', {
      voice:'woman'
    })
  });
  return twiml.toString();
}

function OrderConfirmation(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Thank you for placing your order!')
  .pause(10)
  .gather({
    action:'/billingInfo',
    finishOnKey:'#'
  }, function() {
    this.say('Just to make sure, you are ordering:')
    this.say('1 Grilled Meat Salad (Large). Choice of Dressing: Ranch. Make it with: Buffalo. Instructions: No onions. Total price: $8.99')
    .pause(20)
    .say('Press 1 to confirm.')
    .pause(10)
    .say('Press 2 to go back to the previous options.')
  });
  return twiml.toString();
}

function ConfirmBillingInfo(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Thank you for confirming your order!')
  .say('Please confirm your payment method')
  .pause(10)
  .gather({
    action:'/deliveryMethod',
    finishOnKey:'#'
  }, function(node) {
    node.say('Press 1 to pay with your card on file. Ending in 1 2 3 4')
    .pause(20)
    .say('Press 2 to pay with cash.')
  });
  return twiml.toString();
}

function DeliveryMethod(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Thank you for confirming your payment method!')
  .say('Please confirm your method of delivery')
  .pause(10)
  .gather({
    action:'/checkout',
    finishOnKey:'#'
  }, function(node) {
    node.say('Press 1 have us deliver your order to your address on file. 123 Main Street Denver Colorado.')
    .pause(20)
    .say('Press 2 pick up your order at The Rebellion.')
  });
  return twiml.toString();
}

function Checkout(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Your order is confirmed and being prepaired as we speak!')
  .pause(10)
  .say('We should have your order to you within 45 minutes.')
  .say('Bye for now!')
  return twiml.toString();
}

console.log('TwiML servin\' server running at http://52.9.30.110:8181/');
