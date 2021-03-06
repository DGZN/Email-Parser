  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 39.6762442, lng: -104.9899863}
    });

    var coords = [{lat: 39.698973, lng: -104.9829147},
    {lat: 39.6760779, lng: -104.9984897}, {lat: 39.6551078, lng: -105.0049331},
    {lat: 39.679012, lng: -104.9764677},  {lat: 39.6189287, lng: -104.9871794},
    {lat: 39.665604, lng: -104.9854297},  {lat: 39.6551805, lng: -104.9990304},
    {lat: 39.6543011, lng: -105.0075892}]

    coords.filter((coord) => {
      var marker = new google.maps.Marker({
        position: coord,
        map: map
      });
      // var infowindow = new google.maps.InfoWindow({
      //   content: contentString
      // });
      // marker.addListener('click', function() {
      //   infowindow.open(map, marker);
      // });
    })

    customers = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.4,
      strokeWeight: 0,
      fillColor: '#FF0000',
      fillOpacity: 0.15,
      map: map,
      center: map.center,
      radius: 3100
    });

    customers = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.4,
      strokeWeight: 0,
      fillColor: '#FF0000',
      fillOpacity: 0.15,
      map: map,
      center: {lat: 39.6189287, lng: -104.9871794},
      radius: 700
    });

  }

  $(function(){
    setTimeout(function(){
      $.get('http://localhost:3000/api/v1/orders', function(response){
        var fetching = 0;
        response.data.map((order) => {
          var address = order.customer.address.split('\n').join().split(' ').join(',');
          address = address.replace('\s+',',')
          $.get('http://maps.google.com/maps/api/geocode/json?address='+address+'&sensor=false', function(data){
            console.log(data.results[0].geometry.location);
            setTimeout(function(){
              var marker = new google.maps.Marker({
                position: data.results[0].geometry.location,
                map: map
              });
            },1500)
          })
          fetching++;
        })
      })
    },1000)
  })
