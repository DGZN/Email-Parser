$(function(){
  var displayCaller = true;
  var socket = io.connect('http://localhost:8181');
  socket.on('connect', function(data) {
  });
  socket.on('event', function(data) {
   if (data.name == 'Caller') {
     var caller = data.number.replace('+','');
     console.log("Incomming Call");
     console.log(data.number.replace('+',''));
     if (displayCaller) {
       $('#7202660754')[0].click()
       setTimeout(() => {
         $('#call-order-status').html('In Progress')
       }, 500)
     }
     displayCaller = false;
   }
   if (data.name == 'Order-Options') {
     $('#call-order-status').html('Choosing Order Option')
   }
   if (data.name == 'Recent-Orders') {
     $('#call-order-status').html('Choosing a Recent Order')
   }
   if (data.name == 'Order-Confirmation') {
     $('#call-order-status').html('Order Confirmation')
   }
   if (data.name == 'Billing-Confirmation') {
     $('#call-order-status').html('Billing Info')
   }
   if (data.name == 'Delivery-Confirmation') {
     $('#call-order-status').html('Delivery Method')
   }
   if (data.name == 'Final-Confirmation') {
     $('#call-order-status').html('Final Confirmaton')
   }
   if (data.name == 'Final-Confirmation') {
     $('#call-order-status').html('ORDER CONFIRMED')
     setTimeout(() => {
       $('.ui.modal').modal('hide')
       $('#7202660754-order-card').fadeIn(5000)
     }, 1500)
   }
   console.log("Event: " + data.name);
  });
})
