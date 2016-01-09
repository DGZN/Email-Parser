const fs      = require('fs');
const Imap    = require('imap');
const lazy    = require('lazy');
const debug   = require('debug')('debug:Email-Fetcher');
const inspect = require('util').inspect;

var MailParser = require("mailparser").MailParser;


var imap = new Imap({
  user: 'staff@rebellionpizza.com',
  password: 'rebelStaff',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

var fetched = 0;

var Writable = require('stream').Writable;

var parser = new lazy;
var parsed = 0;

parser.forEach(function(email){
  fs.writeFile(email.path, email.body, (err) => {
    if (err)
      return error('Error writing to ' + path)
    debug('Saved email to ' + email.path)
  });
  parsed++
})

parser.on('pipe', function() {
  debug('Finished parsing ' + parsed + ' products')
})

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  var fs = require('fs'), fileStream;
  openInbox(function(err, box) {
    if (err) throw err;
    imap.search([ 'ALL', ['SINCE', 'January 1, 2015'], ['FROM', 'MaitreD@eat24.com'] ], function(err, results) {
      if (err) throw err;
      var f = imap.fetch(results, { bodies: '' });
      f.on('message', function(msg, seqno) {
        var mailparser = new MailParser();
        var prefix = '(#' + seqno + ') ';
        var data = '';
        msg.on('body', function(stream, info) {
          stream.on('data', function(chunk){
            data+=chunk.toString()
          })
        });
        msg.once('attributes', function(attrs) {
        });
        msg.once('end', function() {
          mailparser.write(data);
          mailparser.end();
          fetched++;
        });
        mailparser.on("end", function(email){
          parser.emit('data', {
            path: 'inbox/msg-' + seqno + '-body.txt'
          , email: email
          , body: email.text
          })
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching ' + fetched + ' messages!');
        imap.end();
      });
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();
