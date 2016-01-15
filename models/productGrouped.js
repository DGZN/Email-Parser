var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductGrouped = new Schema({
  name:    { type: String, required: true  },
  price:   { type: Number, required: true  },
  options: { type: Object, required: true  }
});

module.exports = mongoose.model('ProductGrouped', ProductGrouped);
