var express = require('express');
var router = express.Router();

var Product = require('../models/product');


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/products', function(req, res, next) {
  Product.find(function(err, products) {
    if (err)
      throw err;
    res.render('products', { title: 'Rebellion Products', products:  products});
  });
});

router.get('/products/:id', function(req, res, next) {
  Product.findById(req.params.id, function (err, doc){
    if (err)
      return console.log("!ERROR!", err)
    res.render('recipe', { title: doc.name, recipe: doc.recipe });
  });
});


module.exports = router;
