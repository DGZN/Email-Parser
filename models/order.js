var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
  details:  { type: Object, required: true },
  items:    { type: Array,  required: false },
  raw:      { type: String, required: true },
  date:     { type: String, required: false },
  email:    { type: String, required: false }
});

module.exports = mongoose.model('Order', Order);
