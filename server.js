var http   = require('http')
  , qs     = require('querystring')
  , twilio = require('twilio')
  , debug  = require('debug')('debug:server')

var callerID = false;

var clientSocket = null;

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function(){
    console.log(require('util').inspect(qs.parse(body), { depth: null }));
    callerID = true;
    handleCall(req.url, res, qs.parse(body))
  });
}).listen(8181, '0.0.0.0').on('request', (req) => {
  io.emit('event', {
    name: 'Incomming-Cal'
  , url: req.url
  });
  console.log(req.url + '  <---');
})

var io = require('socket.io')(server);

io.on('connection', function(client) {
  console.log('Client connected...');
  client.on('join', function(data) {
  });
  client.on('messages', function(data) {
     //client.broadcast.emit('broad',data);
  });
});

function handleCall(url, res, data){
  if (data['Digits']) {
    debug('Input Digits: ' + data['Digits'])
  }
  if (data['From']) {
    debug('Call from ' + data['From'].replace(/\*/,''))
    io.emit('event', {
      name: 'Caller'
    , number: data['From'].replace(/\*/,'')
    , body: data
    });
  }
  if (data['RecordingUrl']) {
    debug('New recorded order at: ' + data['RecordingUrl'])
    io.emit('event', {
      name: 'Recorded-Order'
    , order: data['RecordingUrl']
    });
  }
  if (url == '/recordOrder') {
    io.emit('event', {
      name: 'Recording-Order'
    });
    return res.end(RecordOrder());
  }
  if (url == '/order') {
    io.emit('event', {
      name: 'Recent-Orders'
    });
    return res.end(RecentOrders())
  }
  if (url == '/confirmation') {
    io.emit('event', {
      name: 'Order-Confirmation'
    });
    return res.end(OrderConfirmation())
  }
  if (url == '/billingInfo') {
    io.emit('event', {
      name: 'Billing-Confirmation'
    });
    return res.end(ConfirmBillingInfo())
  }
  if (url == '/deliveryMethod') {
    io.emit('event', {
      name: 'Delivery-Confirmation'
    });
    return res.end(DeliveryMethod())
  }
  if (url == '/checkout') {
    io.emit('event', {
      name: 'Final-Confirmation'
    });
    return res.end(Checkout())
  }
  if (!data['msg']) {
    res.end(Greeting(data['From']))
  } else {
    if (data['Digits'] == '1') {
      io.emit('event', {
        name: 'Recent-Orders'
      });
      return res.end(RecentOrders())
    }
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
    action:'/recordOrder',
    finishOnKey:'#'
  }, function() {
    this.say('Please choose from one of the following options')
    .pause(10)
    .say('Press 1 if you know what you would like to order.')
    .pause(10)
    .say('Press 2 to order from your recent history')
    .pause(10)
    .say('Press 2 to talk to a person', {
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
    this.say('Press 1 if you would like to order your last order, which includes')
    .say('1 Seasoned Curly f r i e s, 1  Macaroni Bites, 1 Fire Calzone, (Small), 1 Chicken Caesar Salad and 1 Fire Burger for a total of $29.75')
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
    this.say('1 Fire Calzone, (Small). Choice of Sauce: Hot. $10.49')
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
    node.say('Press 1 to have us deliver this order to your address on file. 4731 S Bannock St, Englewood Colorado 80110')
    .pause(20)
    .say('Press 2 to pick up your order at The Rebellion.')
  });
  return twiml.toString();
}

function Checkout(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Your order is confirmed, and being processed as we speak!')
  .pause(10)
  .say('We should have your order to you within 45 minutes.')
  .say('Bye for now!')
  io.emit('event',  {
    name: 'Order-Checkout'
  })
  return twiml.toString();
}


function RecordOrder(){
  var twiml = new twilio.TwimlResponse();
  twiml.say('Please say what you would like to order, followed by the pound sign.')
  .record({
    action:'/billingInfo'
  , timeout: 10
  , finishOnKey: '#'
  })
  io.emit('event',  {
    name: 'Recording-Order'
  })
  return twiml.toString();
}
console.log('TwiML servin\' server running at http://52.9.30.110:8181/');
