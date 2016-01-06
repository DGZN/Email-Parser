    var util = require('util'),
EventEmitter = require('events').EventEmitter;

function Queue(options) {
  if ( ! (this instanceof Queue) )
    return new Queue(options);
  this._queue    = [];
  this._jobs     = 0;
  this._maxAsync = options.concurrent || 1;
}

Queue.prototype.add = function(item, cb) {
  this._queue.push(item)
  return cb(item);
}

Queue.prototype.processQueue = function() {
  if (this._jobs >= this._maxAsync
    || !this._queue.length
    || !this._queue[0])
    return
}

Queue.prototype.next = function() {
  if (!this._queue.length || this._jobs >= this._maxAsync)
  this._queue.shift()
  this.processQueue()
}

util.inherits(Queue, EventEmitter);
module.exports = Queue;
