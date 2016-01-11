var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderDetails = new Schema({
  code:     { type: String, required: true },
  date:     { type: String, required: true },
  type:     { type: String, required: true },
  customer: { type: Object, required: true },
  order:    { type: Object, required: true }
});

module.exports = mongoose.model('OrderDetails', OrderDetails);
