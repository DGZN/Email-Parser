$(function(){
  $.get('http://dgzn.io:3000/api/v1/customers', (xhr) => {
    var customers = []
    for (var i in xhr.data) {
      customers.push(xhr.data[i].name)
    }
    $('#the-basics .typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'orders',
      source: substringMatcher(customers)
    });
  })
  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;
      matches = [];
      substrRegex = new RegExp(q, 'i');
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  }
});

var orders = ["1x Seasoned Curly Fries $2.29 ",
"1x Macaroni Bites Choice of Dipping Sauce: BBQ $4.49 ",
"1x Fire Calzone (Small) Choice of Sauce: Hot $10.49 ",
"1x Chicken Caesar Salad (Small) Choice of Dressing: Ranch $5.99 ",
"1x Fire Burger Cook Style?: Medium Well Make It: Toasted Sesame Seed Bun Make it with: Regular Choice of Sauce: Fire $6.49 "
]
