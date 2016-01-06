    var util = require('util'),
      parser = require('./parser'),
EventEmitter = require('events').EventEmitter;

function Queue(options) {
  if ( ! (this instanceof Queue) )
    return new Queue(options);
  this._queue   = [];
  this._jobs    = 0;
  this._maxJobs = options.max || 1;
}

Queue.prototype.add = function(item) {
  this._queue.push(item)
  this.processQueue()
}

Queue.prototype.processQueue = function() {
  if (this._jobs >= this._maxJobs
    || !this._queue.length
    || !this._queue[0])
    return;
  var parse = new parser(this._queue[0])
  parse.on('end', function(){
    this.next()
  }.bind(this))
}

Queue.prototype.next = function() {
  if (!this._queue.length || this._jobs >= this._maxJobs)
    return;
  this._queue.shift()
  this.processQueue()
}

util.inherits(Queue, EventEmitter);
module.exports = Queue;
