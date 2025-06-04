import { speciesMarkers } from './storageData.js';
import { syncToIndexedDB } from './storage.js';
import { updateTable } from './ui.js';
import { closeModal, currentLatLng } from './modal.js';
import { map, observerLocation } from './map.js';
import {
  projectID, pointID, observer, surveyType,
  surveyLength, wind, windDir, tempC, precip, siteHabitat
} from './surveyGlobals.js';

// --- Species Search ---
function updateSpeciesList(filter) {
  const list = document.getElementById('speciesList');
  if (!list || !window.speciesList) return;

  list.innerHTML = '';
  window.speciesList
    .filter(sp =>
      sp.code.includes(filter.toUpperCase()) ||
      sp.name.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(sp => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${sp.code}</strong> – ${sp.name} ${sp.soci ? '<span style="color:tomato;">(SOCI)</span>' : ''}`;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        document.getElementById('speciesSearch').value = sp.code;
        list.innerHTML = '';
      };
      list.appendChild(li);
    });
}

// --- Adjust Count ---
function adjustCount(delta) {
  const display = document.getElementById('speciesCountDisplay');
  if (!display) return;
  let count = parseInt(display.textContent || '1', 10);
  if (isNaN(count)) count = 1;
  count += delta;
  if (count < 1) count = 1;
  display.textContent = count;
}

// --- Save Observation ---
function saveSpeciesObservation() {
  const code = document.getElementById('speciesSearch')?.value.trim().toUpperCase();
  const species = window.speciesList?.find(sp => sp.code === code);
  if (!species || !currentLatLng) {
    alert("Invalid species or location.");
    return;
  }

  const count = parseInt(document.getElementById('speciesCountDisplay')?.textContent) || 1;
  const breeding = document.getElementById('breedingInput')?.value || '';
  const note = document.getElementById('noteInput')?.value || '';
  const passHt = document.getElementById('passHtInput')?.value || '';
  const flightDir = document.getElementById('flightDirInput')?.value || '';

  const latlng = currentLatLng;
  const timestamp = new Date().toLocaleString();
  const index = speciesMarkers.length;

  // Distance & bearing
  let dist = 0, angle = 0;
  if (observerLocation) {
    dist = latlng.distanceTo(observerLocation);
    angle = (Math.atan2(
      Math.sin((latlng.lng - observerLocation.lng) * Math.PI / 180) * Math.cos(latlng.lat * Math.PI / 180),
      Math.cos(observerLocation.lat * Math.PI / 180) * Math.sin(latlng.lat * Math.PI / 180) -
      Math.sin(observerLocation.lat * Math.PI / 180) * Math.cos(latlng.lat * Math.PI / 180) *
      Math.cos((latlng.lng - observerLocation.lng) * Math.PI / 180)
    ) * 180 / Math.PI + 360) % 360;
  }

  // Marker and label
  const marker = L.circleMarker(latlng, {
    radius: 10,
    color: species.soci ? 'red' : 'blue',
    fillColor: 'white',
    fillOpacity: 1,
    weight: 2
  }).addTo(map);

  const label = L.marker([latlng.lat, latlng.lng + 0.0001], {
    icon: L.divIcon({
      className: 'marker-label',
      html: `${species.code} (${count})`,
      iconAnchor: [0, 10]
    })
  }).addTo(map);

  const popup = createSpeciesPopupHTML(index, species.code, count, breeding, note);
  marker.bindPopup(popup);

  // Save observation
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
    windDir,
    tempC,
    precip,
    siteHabitat,
    count,
    breeding,
    note,
    passHt,
    flightDir,
    marker,
    label,
    range: Math.round(dist),
    bearing: Math.round(angle),
    timestamp
  });

  syncToIndexedDB();
  updateTable();
  closeModal();
}

// --- Popup HTML ---
function createSpeciesPopupHTML(index, code, count, breeding, note) {
  const popup = document.createElement('div');
  popup.className = 'popup-content';
  popup.innerHTML = `
    <b>${code}</b><br>
    Count: <span id="count-${index}">${count}</span><br>
    <button onclick="incrementCount(${index})">+</button>
    <button onclick="decrementCount(${index})">−</button><br><br>

    <label>Breeding Evidence:<br>
      <select id="breeding-${index}">
        <option value="">None</option>
        <option value="X" ${breeding === 'X' ? 'selected' : ''}>Observed (X)</option>
        <option value="H" ${breeding === 'H' ? 'selected' : ''}>Possible – Singing (H)</option>
        <option value="S" ${breeding === 'S' ? 'selected' : ''}>Possible – Territorial (S)</option>
        <option value="P" ${breeding === 'P' ? 'selected' : ''}>Probable – Pair (P)</option>
        <option value="T" ${breeding === 'T' ? 'selected' : ''}>Probable – Agitated (T)</option>
        <option value="C" ${breeding === 'C' ? 'selected' : ''}>Confirmed – Nest (C)</option>
      </select>
    </label><br>

    <label>Note:<br>
      <textarea id="note-${index}" rows="2" style="width:100%;">${note}</textarea>
    </label><br>

    <button onclick="updateCount(${index})">Update</button>
    <button onclick="deleteMarker(${index})">❌</button>
  `;
  return popup;
}

// --- Count Adjusters ---
function incrementCount(index) {
  const span = document.getElementById(`count-${index}`);
  if (!span) return;
  const val = parseInt(span.textContent || '1', 10);
  span.textContent = val + 1;
}

function decrementCount(index) {
  const span = document.getElementById(`count-${index}`);
  if (!span) return;
  const val = parseInt(span.textContent || '1', 10);
  if (val > 1) span.textContent = val - 1;
}

function updateCount(index) {
  const countEl = document.getElementById(`count-${index}`);
  const breedEl = document.getElementById(`breeding-${index}`);
  const noteEl = document.getElementById(`note-${index}`);
  const record = speciesMarkers[index];
  if (!countEl || !breedEl || !record) return;

  record.count = parseInt(countEl.textContent || '1', 10);
  record.breeding = breedEl.value;
  record.note = noteEl?.value || '';

  record.label.setIcon(L.divIcon({
    className: 'marker-label',
    html: `${record.code} (${record.count})`,
    iconAnchor: [0, 10]
  }));

  syncToIndexedDB();
  updateTable();
  record.marker.closePopup();
}

// --- Exported Functions ---
export {
  updateSpeciesList,
  adjustCount,
  saveSpeciesObservation,
  incrementCount,
  decrementCount,
  updateCount
};

window.adjustCount = adjustCount;
window.saveSpeciesObservation = saveSpeciesObservation;
window.incrementCount = incrementCount;
window.decrementCount = decrementCount;
window.updateCount = updateCount;