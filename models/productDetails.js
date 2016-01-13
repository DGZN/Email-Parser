var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductDetails = new Schema({
  name:    { type: String, required: true  },
  options: { type: Object, required: true  }
});

module.exports = mongoose.model('ProductDetails', ProductDetails);
