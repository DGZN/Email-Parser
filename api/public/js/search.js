function test(result){
  console.log("I was clicked");
  console.log(result);
}
$(function(){
  $('.prompt.search-field').on("change paste keyup", function(){
    searchCustomers($(this).val())
  })
  function searchCustomers(value){
    if (value.length<2)
      return;
    if (isNaN(value)) {
      var query = 'name=' + value
    } else {
      var query = 'phone=' + value
    }
    console.log(query);
    $.get('http://localhost:3000/api/v1/search/customers?' + query, function(xhr){
      html = '';
      xhr.map((customer) => {
        html+= '<div class="card result" >                                                                       \
                  <div class="content" onclick="customerResultModal(this)" data-customer='+encodeURI(JSON.stringify(customer))+'>                 \
                    <div class="header">'+customer.name+'</div>                                           \
                    <div class="meta">'+customer.phone+'</div>                                            \
                  <div class="description">                                                               \
                    '+customer.address+'                                                                  \
                  </div>                                                                                  \
                  </div>                                                                                  \
                </div>'
      })
      $('#search-results').html(html)
    })
  }

})

function customerResultModal(data){
  var data   = $(data).data('customer');
  data = JSON.parse(decodeURI(data));
  var items = data.orders
  var list = '<ul style="line-height: 28px; font-size: 14px;">';
  for(i in items) {
    list+= '<span class="order-item-date">'+items[i].date+'</span>'
    items[i].items.map((item) => {
      list+='<li>'+item+'</li>'
    })
    if (i < items.length-1)
      list+='<hr class="order-item-line"/>'
  }
  list += '</ul>'
  var orderModalContent = '     \
  <div class="row">             \
    <div class="col-md-6">      \
      '+list+'                  \
    </div>                      \
  </div>                        \
  ';
  $('#orderModalHeader').html('# '+data.phone+'<span class="call-order-status" id="call-order-status"></span><span style="float:right;">'+data.name+'</span>')
  $('#orderModalContent').html(orderModalContent)
  $('#orderModalFooter').html('<span style="float: left; font-size: 18px; margin: 7px; font-weight:bold">'+ data.address+'</span>')
  $('.ui.modal').modal('show')
}
