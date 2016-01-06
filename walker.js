    var util = require('util'),
        walk = require('walk'),
EventEmitter = require('events').EventEmitter;


function Walker(dir) {
  this._dir   = dir || __dirname
  this._files = []
  this.walk()
}

Walker.prototype.walk = function(){
  var walker = walk.walk(this._dir, {
    followLinks: false
  });
  walker.on('file', function(root, stat, next) {
    if (this._files.length >= 1000)
      return;
    this._files.push(root + '/' + stat.name);
    this.emit('file', root + '/' + stat.name)
    next();
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
