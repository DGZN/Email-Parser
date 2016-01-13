var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderProduct = new Schema({
  name:    { type: String, required: true  },
  price:   { type: Number, required: true  },
  details: { type: Array,  required: false },
});

module.exports = mongoose.model('OrderProduct', OrderProduct);
