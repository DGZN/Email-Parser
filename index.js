var lazy = require("lazy"),
  walker = require('./walker'),
  queue  = require('./queue')
    jobs = new queue({max: 1});
watcher  = new walker(__dirname+'/inbox'),

watcher.on('file', function(file){
  jobs.add(file)
})
