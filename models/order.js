var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
  file: { type: String, required: true },
  data: { type: String, required: true },
  details: { type: String, required: true },
  items: { type: Array, required: true },
  total: { type: String, required: true }
});

module.exports = mongoose.model('Order', Order);
