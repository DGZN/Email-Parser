    var util = require('util'),
        walk = require('walk'),
EventEmitter = require('events').EventEmitter;


function Walker(options) {
  this._dir = options.dir || __dirname
  this.max  = options.max || 10000
  this._files = []
  this.walk()
}

Walker.prototype.walk = function(){
  var walker = walk.walk(this._dir, {
    followLinks: false
  });
  walker.on('file', function(root, stat, next) {
    if (this._files.length >= this.max)
      return;
    this._files.push(root + '/' + stat.name);
    this.emit('file', root + '/' + stat.name)
    setTimeout(function(){
      next();
    },100)
  }.bind(this));
  walker.on('end', function() {
    this.emit('end', this.files())
  }.bind(this));
}

Walker.prototype.files = function(){
  return {
    files: this._files
  , count: this._files.length
  }
}

util.inherits(Walker, EventEmitter);
module.exports = Walker;
