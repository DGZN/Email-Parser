$(function(){
  $('#recipe a').each(function(item){
    var link = $(this).html()
    switch (link) {
      case 'read more':
        $(this).remove()
        break;
      case 'less':
        $(this).remove()
        break;
      default:
        $(this).replaceWith($(this).html())
    }
  })
})
