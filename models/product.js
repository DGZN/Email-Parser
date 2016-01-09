var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Product = new Schema({
  data: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Product', Product);
