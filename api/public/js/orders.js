$(function(){
  console.log("started");
})

function orderModal(data){
  var data = $(data).data('order');
  var items = data.order.items;
  var list = '<h4>Items:</h4> <ul style="line-height: 28px; font-size: 14px;">';
  for(i in items) {
    list+='<li>'+items[i]+'</li>'
  }
  list+='<h4>Instructions:</h4> </ul>'
  var instructions = '<ul style="line-height: 28px; font-size: 14px; list-style: none;">';
  var instructionItems = data.order.receipt[0].split(',');
  for(i in instructionItems) {
    instructions+='<li>'+instructionItems[i]+'</li>'
  }
  instructions+='</ul>'

  var orderModalContent = '     \
  <div class="row">             \
    <div class="col-md-6">      \
      '+list+'                  \
      '+instructions+'          \
    </div>                      \
  </div>                        \
  ';
  console.log(data.order.receipt[0].split(','));
  console.log(data);
  $('#orderModalHeader').html('#'+data.code + '<span style="float:right;">'+data.customer.name+' ' + data.customer.phone  +'</span>')
  $('#orderModalContent').html(orderModalContent)
  $('#orderModalFooter').html('<span style="float: left; font-size: 18px; margin: 7px; font-weight:bold">'+ data.customer.address+'</span>')
  $('.ui.modal').modal('show')
}
