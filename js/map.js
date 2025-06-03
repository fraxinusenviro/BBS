// js/map.js

// Global map and location variables
let map;
let observerLocation = null;
let userLocationMarker = null;
let userAccuracyCircle = null;
let overlayGroup = null;

// Initialize map and geolocation logic
function initializeMap() {
  map = L.map('map');

  // Base layers
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
  L.control.layers({ "OSM": osm, "Satellite": satellite }).addTo(map);

  // Live geolocation tracking
  navigator.geolocation.watchPosition(
    position => {
      const latlng = [position.coords.latitude, position.coords.longitude];
      const accuracy = position.coords.accuracy;

      observerLocation = L.latLng(latlng);

      if (userLocationMarker) {
        userLocationMarker.setLatLng(latlng);
        userAccuracyCircle.setLatLng(latlng).setRadius(accuracy);
      } else {
        userLocationMarker = L.circleMarker(latlng, {
          radius: 6,
          color: '#00f',
          fillColor: '#00f',
          fillOpacity: 1,
          weight: 1
        }).addTo(map);

        userAccuracyCircle = L.circle(latlng, {
          radius: accuracy,
          color: '#00f',
          fillColor: '#00f',
          fillOpacity: 0.2,
          weight: 1
        }).addTo(map);

        map.setView(latlng, 17);
      }
    },
    err => console.error('Geolocation error:', err),
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    }
  );

  // Click to show modal for new species
  map.on('click', e => {
    if (!placingPoint) showSpeciesModal(e.latlng);
  });

  // Add buttons after map is ready
  addMasterButtons();
}

// Add UI buttons to #masterButton
function addMasterButtons() {
  const container = document.getElementById('masterButton');
  if (!container) return;

  container.innerHTML = `
    <button onclick="document.getElementById('surveyModal').style.display = 'block'">Survey Metadata</button>
    <button onclick="openDrawer()">Observations</button>
    <button onclick="toggleOverlay()">Overlay</button>
  `;

  container.style.position = 'absolute';
  container.style.top = '10px';
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.zIndex = 2000;
  container.style.display = 'flex';
  container.style.gap = '10px';
}

window.addMasterButtons = addMasterButtons;

// Utility to calculate destination from point, bearing, and distance
function destinationPoint(latlng, bearing, distance) {
  const R = 6378137; // Earth radius in meters
  const δ = distance / R;
  const θ = bearing * Math.PI / 180;
  const φ1 = latlng.lat * Math.PI / 180;
  const λ1 = latlng.lng * Math.PI / 180;

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );

  return L.latLng(φ2 * 180 / Math.PI, λ2 * 180 / Math.PI);
}

// Toggle circular overlay with bearings and distances
function toggleOverlay() {
  if (overlayGroup) {
    map.removeLayer(overlayGroup);
    overlayGroup = null;
  } else if (observerLocation) {
    const center = observerLocation;
    overlayGroup = L.layerGroup();

    [50, 100, 150].forEach(r => {
      L.circle(center, { radius: r, color: 'red', dashArray: '4', fillOpacity: 0 }).addTo(overlayGroup);
    });

    [0, 45, 90, 135, 180, 225, 270, 315].forEach(angle => {
      const end = destinationPoint(center, angle, 150);
      L.polyline([center, end], { color: 'red', weight: 1 }).addTo(overlayGroup);
    });

    const dirs = { N: 0, E: 90, S: 180, W: 270 };
    for (const [txt, angle] of Object.entries(dirs)) {
      const pt = destinationPoint(center, angle, 160);
      L.marker(pt, {
        icon: L.divIcon({ className: 'target-label', html: txt })
      }).addTo(overlayGroup);
    }

    overlayGroup.addTo(map);
  }
}

// Expose public functions
window.toggleOverlay = toggleOverlay;

// Start everything once DOM is ready
document.addEventListener('DOMContentLoaded', initializeMap);
