var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Product = new Schema({
  name:   { type: String, required: true  },
  price:  { type: String, required: true  },
  desc:   { type: String, required: false },
  extras: { type: Array,  required: false }
});

module.exports = mongoose.model('Product', Product);
