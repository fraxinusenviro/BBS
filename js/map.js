// js/map.js

// Global map and location variables
let map;
let observerLocation = null;
let userLocationMarker = null;
let userAccuracyCircle = null;
let overlayGroup = null;

import { loadSpeciesMarkers } from './storage.js';
import { speciesMarkers } from './storageData.js';
import { updateTable, openSurveyModal, openDrawer } from './ui.js';
import { showSpeciesModal, isPlacingPoint } from './modal.js'; // ✅ FIXED

// Initialize map and geolocation logic
function initializeMap() {
  map = L.map('map');
  map.doubleClickZoom.disable();

  // Base layers
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
  L.control.layers({ "OSM": osm, "Satellite": satellite }).addTo(map);

  // Click to show modal for new species
  map.on('click', e => {
    if (!isPlacingPoint()) showSpeciesModal(e.latlng);

});

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
          fillColor: 'white',
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

  // Add buttons after map is ready
  addMasterButtons();

  // Load saved species markers from IndexedDB
  loadSpeciesMarkers().then(() => {
    speciesMarkers.forEach((obs, index) => {
      const marker = L.circleMarker(obs.latlng, {
        radius: 20,
        color: obs.soci ? 'red' : 'blue',
        fillColor: 'white',
        fillOpacity: 0.8,
        weight: 2
      }).addTo(map);

      const label = L.marker([obs.latlng.lat, obs.latlng.lng + 0.0001], {
        icon: L.divIcon({
          className: 'marker-label',
          html: `${obs.code} (${obs.count})`,
          iconAnchor: [0, 10]
        })
      }).addTo(map);

      marker.bindPopup(createSpeciesPopupHTML(index, obs));

      obs.marker = marker;
      obs.label = label;
    });

    updateTable();
  });
}

// Add master UI buttons 
function addMasterButtons() {
  const container = document.getElementById('masterButton');
  if (!container) return;

  container.innerHTML = `
    <button onclick="showInstructions()" title="Help"><i class="fas fa-circle-question fa-2x"></i></button>
    <button id="btnSurvey" title="Survey Metadata"><i class="fas fa-clipboard-list fa-2x"></i></button>
    <button id="btnDrawer" title="Observations"><i class="fas fa-rectangle-list fa-2x"></i></button>
    <button id="btnOverlay" title="Overlay"><i class="fas fa-life-ring fa-2x"></i></button>
  `;

  container.style.position = 'absolute';
  container.style.top = '100px';
  container.style.left = '30px';
  container.style.zIndex = 2000;
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';

  document.getElementById('btnSurvey')?.addEventListener('click', openSurveyModal);
  document.getElementById('btnDrawer')?.addEventListener('click', openDrawer);
  document.getElementById('btnOverlay')?.addEventListener('click', toggleOverlay);
}

// Calculate a destination point given a start latlng, bearing (deg), and distance (meters)
function destinationPoint(latlng, bearing, distance) {
  const R = 6378137;
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

    // Concentric circles with labels
    [50, 100, 150, 200].forEach(radius => {
      // Draw circle
      L.circle(center, {
        radius: radius,
        color: 'red',
        dashArray: '5',
        weight: 2,
        fillOpacity: 0
      }).addTo(overlayGroup);

      // Label the circle on the north axis
      const labelPos = destinationPoint(center, 0, radius); // 0° = north
      L.marker(labelPos, {
        icon: L.divIcon({
          className: 'circle-label',
          html: `<span>${radius} m</span>`,
          iconAnchor: [0, 0]
        })
      }).addTo(overlayGroup);
    });

    // Radial lines (bearings)
    [0, 45, 90, 135, 180, 225, 270, 315].forEach(angle => {
      const end = destinationPoint(center, angle, 200);
      L.polyline([center, end], {
        color: 'yellow',
        dashArray: '5',
        weight: 0.5
      }).addTo(overlayGroup);
    });

    // Cardinal direction labels
    const dirs = {N: 0,E: 90,S: 180,W: 270 };
    for (const [txt, angle] of Object.entries(dirs)) {
      const pt = destinationPoint(center, angle, 215);
      L.marker(pt, {
        icon: L.divIcon({ className: 'target-label', html: txt })
      }).addTo(overlayGroup);
    }

    overlayGroup.addTo(map);
  }
}

window.toggleOverlay = toggleOverlay;

document.addEventListener('DOMContentLoaded', initializeMap);

export { map, observerLocation };