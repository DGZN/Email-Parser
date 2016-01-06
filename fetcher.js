var Imap = require('imap'),
    inspect = require('util').inspect;

var imap = new Imap({
  user: 'staff@rebellionpizza.com',
  password: 'rebelStaff',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  var fs = require('fs'), fileStream;
  openInbox(function(err, box) {
    if (err) throw err;
    imap.search([ ['FROM', 'MaitreD@eat24.com'] ], function(err, results) {
      if (err) throw err;
      var f = imap.fetch(results, { bodies: '' });
      f.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
          console.log(prefix + 'Body');
          stream.pipe(fs.createWriteStream('inbox/msg-' + seqno + '-body.txt'));
        });
        msg.once('attributes', function(attrs) {
          console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
        });
        msg.once('end', function() {
          console.log(prefix + 'Finished');
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
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
