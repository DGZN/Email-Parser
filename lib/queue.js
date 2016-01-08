    var util = require('util'),
       debug = require('debug')('queue:debug')
EventEmitter = require('events').EventEmitter;

function Queue(options){
  EventEmitter.call(this)
  this.ready = true,
  this.failed = [],
  this.queuedJobs = [];
  //this.emit('ready', 'bar')
}

Queue.prototype.batch = function(jobs){
  for (var i in jobs) {
    this.queuedJobs.push({
      id: this.queuedJobs.length
    , file: jobs[i]
    })
  }
  this.process(this.job())
}

Queue.prototype.push = function(file){
  this.queuedJobs.push({
    id: this.queuedJobs.length
  , file: file
  })
  if (this.ready && this.queuedJobs.length == 1)
    this.process(this.job())
}

Queue.prototype.process = function(job){
  if (!this.ready)
    return;
  this.ready = false;
  this.emit('ready', job, function(status){
    this.complete(job, status)
  }.bind(this))
}

Queue.prototype.job = function(){
  for (var id in this.queuedJobs) {
    if (typeof this.queuedJobs[id].status == "undefined") {
      var job = this.queuedJobs[id];
      break;
    }
  }
  if (!job)
    return false;
  return job;
}


Queue.prototype.complete = function(job, status){
  this.queuedJobs[job.id].status = status
  if (!this.job())
    return debug('no more jobs')
  this.ready = true;
  this.process(this.job())
}

Queue.prototype.done = function(onComplete){
  this.onComplete = onComplete
}

Queue.prototype.stats = function(){
  return {
    total: this.queuedJobs.length
  , lastJob: this.job()
  , failed:  {
      count: this.failed.length
    , files: this.failed
    }
  }
}

Queue.prototype.logFailed = function(job){
  this.failed.push(job)
  errors('empty @ ' + job.file)
}

util.inherits(Queue, EventEmitter);
module.exports = Queue;
