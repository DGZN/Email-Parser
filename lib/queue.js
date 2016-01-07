    var util = require('util'),
       debug = require('debug')('queue')
EventEmitter = require('events').EventEmitter;

function Queue(options) {
  this._queue    = [];
  this._jobs     = 0;
  this._maxAsync = options.concurrent || 1;
}

Queue.prototype.add = function(item, cb) {
  if (!item)
    return
  this._queue.push(item)
  this.process(item, cb)
}

Queue.prototype.process = function(item, cb) {
  if (this._jobs >= this._maxAsync || !item)
    return
  this._jobs--
  this._queue.shift()
  debug('processing ' + item)
  return cb(item, function(){
    this.next()
  }.bind(this))
}

Queue.prototype.next = function() {
  if (this._jobs >= this._maxAsync || !this._queue.length)
  this.process(this._queue[0])
}

util.inherits(Queue, EventEmitter);
module.exports = Queue;
