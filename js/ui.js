// ui.js

// --- Imports ---
import {
  exportSpeciesCSV,
  exportSpeciesGeoJSON,
  exportSpeciesKML
} from './export.js';

import { map } from './map.js';
import { speciesMarkers } from './storageData.js';
import {
  projectID,
  pointID,
  observer,
  surveyType,
  surveyLength,
  wind,
  windDir,
  tempC,
  precip,
  siteHabitat,
  setSurveyMetadata
} from './surveyGlobals.js';

// --- Drawer and modal toggles ---
function openDrawer() {
  document.getElementById('dataDrawer').style.display = 'block';
  document.getElementById('modalBackdrop').style.display = 'block';
}

function closeDrawer() {
  document.getElementById('dataDrawer').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}

function openSurveyModal() {
  const modal = document.getElementById('surveyModal');
  const backdrop = document.getElementById('modalBackdrop');
  if (!modal || !backdrop) return;

  // Prefill modal with current metadata values
  document.getElementById('observerInput').value = observer || '';
  document.getElementById('pointIDInput').value = pointID || '';
  document.getElementById('surveyTypeInput').value = surveyType || '';
  document.getElementById('surveyLengthInput').value = surveyLength || '';
  document.getElementById('windInput').value = wind || '';
  document.getElementById('windDirInput').value = windDir || '';
  document.getElementById('tempCInput').value = tempC || '';
  document.getElementById('precipInput').value = precip || '';
  document.getElementById('siteHabitatInput').value = siteHabitat || '';

  modal.style.display = 'block';
  backdrop.style.display = 'block';
}

function closeSurveyModal() {
  setSurveyMetadata({
    observer: document.getElementById('observerInput').value.trim(),
    pointID: document.getElementById('pointIDInput').value.trim(),
    surveyType: document.getElementById('surveyTypeInput').value.trim(),
    surveyLength: document.getElementById('surveyLengthInput').value.trim(),
    wind: document.getElementById('windInput').value.trim(),
    windDir: document.getElementById('windDirInput').value.trim(),
    tempC: document.getElementById('tempCInput').value.trim(),
    precip: document.getElementById('precipInput').value.trim(),
    siteHabitat: document.getElementById('siteHabitatInput').value.trim()
  });

  document.getElementById('surveyModal').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}

// --- Table Renderer ---
function updateTable() {
  const drawer = document.getElementById('dataDrawer');
  if (!drawer || !Array.isArray(speciesMarkers)) return;

  drawer.innerHTML = `
    <div class="drawer">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="display: flex; gap: 10px;">
          <button onclick="exportSpeciesCSV()">Export CSV</button>
          <button onclick="exportSpeciesGeoJSON()">Export GeoJSON</button>
          <button onclick="exportSpeciesKML()">Export KML</button>
        </div>
        <button onclick="closeDrawer()">❌</button>
      </div>
      <h2 style="margin-top: 0;">Observed Species</h2>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Project</th><th>Point</th><th>Observer</th><th>Type</th><th>Length</th>
            <th>Wind</th><th>Dir</th><th>Temp</th><th>Precip</th><th>Habitat</th>
            <th>Species</th><th>Count</th><th>Range</th><th>Bearing</th>
            <th>Pass Ht</th><th>Flight Dir</th><th>Note</th><th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="obsTableBody"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('obsTableBody');
  speciesMarkers.forEach((obs, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${obs.projectID || ''}</td>
      <td>${obs.pointID || ''}</td>
      <td>${obs.observer || ''}</td>
      <td>${obs.surveyType || ''}</td>
      <td>${obs.surveyLength || ''}</td>
      <td>${obs.wind || ''}</td>
      <td>${obs.windDir || ''}</td>
      <td>${obs.tempC || ''}</td>
      <td>${obs.precip || ''}</td>
      <td>${obs.siteHabitat || ''}</td>
      <td>${obs.code || ''}</td>
      <td>${obs.count || ''}</td>
      <td>${obs.range || ''}</td>
      <td>${obs.bearing || ''}</td>
      <td>${obs.passHt || ''}</td>
      <td>${obs.flightDir || ''}</td>
      <td>${obs.note || ''}</td>
      <td>${obs.timestamp}</td>
      <td>
        <button onclick="zoomToMarker(${i})">🔍</button>
        <button onclick="deleteMarker(${i})" style="color:red;">❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- Map actions ---
function zoomToMarker(index) {
  const obs = speciesMarkers[index];
  if (obs && obs.latlng) {
    map.setView(obs.latlng, 18);
    obs.marker.openPopup();
  }
}

function deleteMarker(index) {
  if (!speciesMarkers || !speciesMarkers[index]) return;

  const obs = speciesMarkers[index];
  if (obs.marker) map.removeLayer(obs.marker);
  if (obs.label) map.removeLayer(obs.label);

  speciesMarkers.splice(index, 1);
  if (typeof syncToIndexedDB === 'function') syncToIndexedDB();

  updateTable();
}

// --- Modal Injectors ---
function injectSurveyModal() {
  const container = document.getElementById('surveyModal');
  container.innerHTML = `
    <div class="modal-content">
      <h2>Survey Metadata</h2>
      <label>Observer: <input type="text" id="observerInput" /></label><br>
      <label>Survey Point ID: <input type="text" id="pointIDInput" /></label><br>
      <label>Survey Type: <input type="text" id="surveyTypeInput" /></label><br>
      <label>Survey Length (min): <input type="number" id="surveyLengthInput" /></label><br>
      <label>Wind: <input type="text" id="windInput" /></label><br>
      <label>Wind Direction: <input type="text" id="windDirInput" /></label><br>
      <label>Temperature (°C): <input type="number" id="tempCInput" /></label><br>
      <label>Precipitation: <input type="text" id="precipInput" /></label><br>
      <label>Habitat: <input type="text" id="siteHabitatInput" /></label><br><br>
      <button onclick="closeSurveyModal()">Close</button>
    </div>
  `;
}

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  injectSurveyModal();
  updateTable();
});

// --- Exports ---
export {
  openDrawer,
  closeDrawer,
  openSurveyModal,
  closeSurveyModal,
  updateTable,
  zoomToMarker,
  deleteMarker
};

window.closeSurveyModal = closeSurveyModal;
window.closeDrawer = closeDrawer;
window.openSurveyModal = openSurveyModal;
window.zoomToMarker = zoomToMarker;
window.deleteMarker = deleteMarker;