var lazy = require("lazy"),
  walker = require('./walker');
  parser = require('./parser');


var dir = new walker(__dirname+'/inbox')

dir.on('file', function(file){
  var parse = new parser(file, function(error, data){
    if (error) {
      return console.log("@error", error);
    }
    console.log(data);
  })
})
