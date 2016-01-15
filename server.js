var http   = require('http')
  , qs     = require('querystring')
  , twilio = require('twilio')
  , debug  = require('debug')('debug:server')


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function(){
    handleCall(res, qs.parse(body))
  });
}).listen(8181, '0.0.0.0').on('request', (req) => {
  console.log(req.url + '  <---');
})

function handleCall(res, data){
  if (!data['msg']) {
    res.end(Greeting(data['From']))
  } else {
    res.end(Menu())
  }
  if (data['From'])
    debug('Call from ' + data['From'].replace(/\*/,''))
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
    action:'http://1c2095c5.ngrok.io/order',
    finishOnKey:'#'
  }, function() {
    this.say('Press 1 to order from your recent history')
    .pause(10)
    .say('Press 2 to hear a menu')
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
    action:'http://1c2095c5.ngrok.io/selection',
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

console.log('TwiML servin\' server running at http://52.9.30.110:8181/');
