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
  cb(item, () => {
    process.nextTick(() => {
      this.next()
    });
  }.bind(this))
}

Queue.prototype.next = function() {
  if (this._jobs >= this._maxAsync || !this._queue.length) {
    if (typeof this._finish == 'function')
      return this._finish()
    return;
  }
  this.process(this._queue[0])
}

Queue.prototype.finish = function(cb) {
  this._finish = cb
}

util.inherits(Queue, EventEmitter);
module.exports = Queue;
