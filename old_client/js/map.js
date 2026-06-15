window.mapHelper = {
  map: null,
  markers: [],

  init: () => {
    if(typeof google === 'undefined') {
      console.warn("Google Maps API not loaded. Map will not display.");
      return;
    }

    const center = { lat: 0, lng: 0 }; 

    window.mapHelper.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: center,
      mapTypeId: 'roadmap',
      styles: [
        {
          "featureType": "poi.business",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        window.mapHelper.map.setCenter(userLoc);
      });
    }

    if(typeof ngoHelper !== 'undefined') {
      ngoHelper.fetchAvailableDonations();
    }
  },

  addMarkers: (donations) => {
    if(!window.mapHelper.map) return;

    window.mapHelper.markers.forEach(m => m.setMap(null));
    window.mapHelper.markers = [];

    const infowindow = new google.maps.InfoWindow();

    donations.forEach(d => {
      if(d.location && d.location.coordinates && d.location.coordinates.length === 2) {
        const pos = { lat: d.location.coordinates[1], lng: d.location.coordinates[0] };
        
        const marker = new google.maps.Marker({
          position: pos,
          map: window.mapHelper.map,
          title: d.foodType,
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });

        marker.addListener('click', () => {
          const content = `
            <div class="map-info-window">
              <h4>${d.foodType}</h4>
              <span class="badge badge-open">Open</span>
              <p><strong>Quantity:</strong> ${d.quantity}</p>
              <p><strong>Pickup:</strong> ${d.pickupAddress}</p>
              <button class="btn btn-primary" onclick="ngoHelper.claimDonation('${d._id}')">Claim</button>
            </div>
          `;
          infowindow.setContent(content);
          infowindow.open(window.mapHelper.map, marker);
        });

        window.mapHelper.markers.push(marker);
      }
    });
  }
};

function initMap() {
  window.mapHelper.init();
}
