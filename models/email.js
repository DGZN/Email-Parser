var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Email = new Schema({
  subject: { type: String, required: true  },
  date:    { type: String, required: true  },
  file:    { type: String, required: true },
  body:    { type: String, required: true },
  html:    { type: String, required: true }
});

module.exports = mongoose.model('Email', Email);
