var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Customer = new Schema({
  name:    { type: String, required: true  },
  phone:   { type: String, required: true  },
  address: { type: String, required: false },
  count:   { type: Number, required: false },
  orders:  { type: Array,  required: false },
});

module.exports = mongoose.model('Customer', Customer);
