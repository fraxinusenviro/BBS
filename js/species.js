// js/species.js

// Assumes global: speciesList, currentLatLng, map, observerLocation
const speciesMarkers = [];
window.speciesMarkers = speciesMarkers;

function updateSpeciesList(filter) {
  const list = document.getElementById('speciesList');
  if (!list) return;

  list.innerHTML = '';

  speciesList
    .filter(sp =>
      sp.code.includes(filter.toUpperCase()) ||
      sp.name.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(sp => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${sp.code}</strong> – ${sp.name} ${sp.soci ? '<span style="color:tomato;">(SOCI)</span>' : ''}`;
      li.style.cursor = 'pointer';
      li.onclick = () => placeSpeciesPoint(sp.code);
      list.appendChild(li);
    });
}

function placeSpeciesPoint(code) {
  const species = speciesList.find(sp => sp.code === code);
  if (!species || !currentLatLng) return;

  // Get metadata from survey modal
  const observer = document.getElementById('observer')?.value || '';
  const pointID = document.getElementById('pointID')?.value || '';
  const projectID = document.getElementById('projectID')?.value || '';
  const surveyType = document.getElementById('surveyType')?.value || '';
  const surveyLength = parseInt(document.getElementById('surveyLength')?.value) || '';
  const wind = document.getElementById('wind')?.value || '';
  const precip = document.getElementById('precip')?.value || '';
  const latlng = currentLatLng;
  const count = 1;
  const timestamp = new Date().toLocaleString();

  const index = speciesMarkers.length;

  // Create map marker and label
  const marker = L.circleMarker(latlng, {
    radius: 10,
    color: species.soci ? 'red' : 'blue',
    fillColor: 'white',
    fillOpacity: 1,
    weight: 2
  }).addTo(map);

  const label = L.divIcon({
    className: 'marker-label',
    html: `${species.code} (${count})`,
    iconAnchor: [0, 10]
  });

  const labelMarker = L.marker([latlng.lat, latlng.lng + 0.0001], { icon: label }).addTo(map);

  // Calculate range and bearing
  let dist = 0, angle = 0;
  if (observerLocation) {
    dist = latlng.distanceTo(observerLocation);
    angle = (Math.atan2(
      Math.sin((latlng.lng - observerLocation.lng) * Math.PI / 180) *
      Math.cos(latlng.lat * Math.PI / 180),
      Math.cos(observerLocation.lat * Math.PI / 180) *
      Math.sin(latlng.lat * Math.PI / 180) -
      Math.sin(observerLocation.lat * Math.PI / 180) *
      Math.cos(latlng.lat * Math.PI / 180) *
      Math.cos((latlng.lng - observerLocation.lng) * Math.PI / 180)
    ) * 180 / Math.PI + 360) % 360;
  }

  // Construct popup
  const popup = document.createElement('div');
  popup.className = 'popup-content';
  popup.innerHTML = `
    <b>${species.code}</b><br>
    Count: <span id="count-${index}">${count}</span><br>
    <button onclick="incrementCount(${index})">+</button>
    <button onclick="decrementCount(${index})">−</button><br><br>
    
    <label>Breeding Evidence:<br>
      <select id="breeding-${index}">
        <option value="">Select</option>
        <option value="X">Observed (X)</option>
        <option value="H">Possible (H)</option>
        <option value="S">Possible (S)</option>
        <option value="P">Probable (P)</option>
        <option value="T">Probable (T)</option>
        <option value="C">Confirmed (C)</option>
      </select>
    </label><br>

    <label>Notes:<br>
      <textarea id="note-${index}" rows="2" style="width:100%;"></textarea>
    </label><br>

    <button onclick="updateCount(${index})">Update</button>
    <button onclick="deleteMarker(${index})">Delete</button>
  `;

  marker.bindPopup(popup);

  speciesMarkers.push({
    code: species.code,
    name: species.name,
    soci: species.soci,
    latlng,
    observer,
    pointID,
    projectID,
    surveyType,
    surveyLength,
    wind,
    precip,
    count,
    breeding: '',
    note: '',
    marker,
    label: labelMarker,
    range: Math.round(dist),
    bearing: Math.round(angle),
    timestamp
  });

  updateTable();
  closeModal();
}

function incrementCount(index) {
  const span = document.getElementById(`count-${index}`);
  if (!span) return;
  span.textContent = parseInt(span.textContent) + 1;
}

function decrementCount(index) {
  const span = document.getElementById(`count-${index}`);
  if (!span) return;
  const current = parseInt(span.textContent);
  if (current > 1) span.textContent = current - 1;
}

function updateCount(index) {
  const countEl = document.getElementById(`count-${index}`);
  const breedEl = document.getElementById(`breeding-${index}`);
  const noteEl = document.getElementById(`note-${index}`);
  if (!countEl || !breedEl || !speciesMarkers[index]) return;

  speciesMarkers[index].count = parseInt(countEl.textContent) || 1;
  speciesMarkers[index].breeding = breedEl.value || '';
  speciesMarkers[index].note = noteEl?.value || '';

  // Update label
  speciesMarkers[index].label.setIcon(L.divIcon({
    className: 'marker-label',
    html: `${speciesMarkers[index].code} (${speciesMarkers[index].count})`,
    iconAnchor: [0, 10]
  }));

  updateTable();
  speciesMarkers[index].marker.closePopup();
}

window.updateSpeciesList = updateSpeciesList;
