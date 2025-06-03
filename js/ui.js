function openDrawer() {
  document.getElementById('dataDrawer').style.display = 'block';
  document.getElementById('modalBackdrop').style.display = 'block';
}

function closeDrawer() {
  document.getElementById('dataDrawer').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}

function openSurveyModal() {
  document.getElementById('surveyModal').style.display = 'block';
  document.getElementById('modalBackdrop').style.display = 'block';
}

function closeSurveyModal() {
  document.getElementById('surveyModal').style.display = 'none';
  document.getElementById('modalBackdrop').style.display = 'none';
}

function updateTable() {
  const drawer = document.getElementById('dataDrawer');
  if (!drawer || !Array.isArray(speciesMarkers)) return;

  drawer.innerHTML = `
    <div class="drawer">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="display: flex; gap: 10px;">
          <button onclick="exportSpeciesCSV()">Export CSV</button>
          <button onclick="exportSpeciesGeoJSON()">Export GeoJSON</button>
        </div>
        <button onclick="closeDrawer()">X</button>
      </div>
      <h2 style="margin-top: 0;">Observed Species</h2>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Code</th>
            <th>Count</th>
            <th>Breeding</th>
            <th>Bearing</th>
            <th>Dist (m)</th>
            <th>Survey Type</th>
            <th>Survey Length</th>
            <th>Wind</th>
            <th>Precip</th>
            <th>Note</th>
            <th>Time</th>
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
      <td>${obs.code}</td>
      <td>${obs.count}</td>
      <td>${obs.breeding || ''}</td>
      <td>${obs.bearing || ''}</td>
      <td>${obs.range || ''}</td>
      <td>${obs.surveyType || ''}</td>
      <td>${obs.surveyLength || ''}</td>
      <td>${obs.wind || ''}</td>
      <td>${obs.precip || ''}</td>
      <td>${obs.note || ''}</td>
      <td>${obs.timestamp}</td>
      <td>
        <button onclick="zoomToMarker(${i})">🔍</button>
<button onclick="deleteMarker(${i})" style="color: red;">❌</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function zoomToMarker(index) {
  const obs = speciesMarkers[index];
  if (obs && obs.latlng) {
    map.setView(obs.latlng, 18);
    obs.marker.openPopup();
  }
}

function deleteMarker(index) {
  if (!speciesMarkers || !speciesMarkers[index]) return;

  // Remove marker from map
  const obs = speciesMarkers[index];
  if (obs.marker) {
    map.removeLayer(obs.marker);
  }

  // Remove from array
  speciesMarkers.splice(index, 1);

  // Re-render table
  updateTable();
}

function injectSurveyModal() {
  const container = document.getElementById('surveyModal');
  container.innerHTML = `
    <div class="modal" style="background:#2b2b2b; padding:20px; border-radius:8px; color:#fff;">
      <h2>Survey Metadata</h2>
      <label>Observer:<br><input id="observer" type="text"></label><br>
      <label>Survey Point ID:<br><input id="pointID" type="text"></label><br>
      <label>Project ID:<br><input id="projectID" type="text"></label><br>

      <label>Survey Type:<br>
        <select id="surveyType">
          <option value="Spring Migration">Spring Migration</option>
          <option value="Breeding">Breeding</option>
          <option value="Fall Migration">Fall Migration</option>
          <option value="Winter Residency">Winter Residency</option>
          <option value="Diurnal Raptor">Diurnal Raptor</option>
          <option value="Nightjar">Nightjar</option>
          <option value="Nocturnal Owls">Nocturnal Owls</option>
        </select>
      </label><br>

      <label>Survey Length (minutes):<br><input id="surveyLength" type="number" min="1"></label><br>

      <label>Wind:Beaufort Scale<br>
  <select id="wind">
    <option value="Calm (0 km/h)">0: Calm (0 km/h)</option>
    <option value="Light air (2–5 km/h)">1: Light air (2–5 km/h)</option>
    <option value="Light breeze (6–11 km/h)">2: Light breeze (6–11 km/h)</option>
    <option value="Gentle breeze (12–19 km/h)">3: Gentle breeze (12–19 km/h)</option>
    <option value="Moderate breeze (20–28 km/h)">4: Moderate breeze (20–28 km/h)</option>
    <option value="Fresh breeze (29–38 km/h)">5: Fresh breeze (29–38 km/h)</option>
    <option value="Strong breeze (39–49 km/h)">6: Strong breeze (39–49 km/h)</option>
    <option value="High wind (50–61 km/h)">7: High wind (50–61 km/h)</option>
    <option value="Gale (62–74 km/h)">8: Gale (62–74 km/h)</option>
    <option value="Severe gale (75–88 km/h)">9: Severe gale (75–88 km/h)</option>
    <option value="Storm (89–102 km/h)">10: Storm (89–102 km/h)</option>
    <option value="Violent storm (103–117 km/h)">11: Violent storm (103–117 km/h)</option>
    <option value="Hurricane (≥118 km/h)">12: Hurricane (≥118 km/h)</option>
  </select>
</label><br>
      <label>Precipitation:<br>
        <select id="precip">
          <option value="None">None</option>
          <option value="Light Mist">Light Mist</option>
          <option value="Light Flurries">Light Flurries</option>
          <option value="Rain">Rain</option>
          <option value="Snow">Snow</option>
        </select>
      </label><br>

      <button onclick="closeSurveyModal()">Close</button>
    </div>
  `;

  container.style.display = 'none';
  container.style.position = 'absolute';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.zIndex = 3000;
}

function injectSpeciesModal() {
  const container = document.getElementById('speciesModal');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-window" style="background:#2b2b2b; padding:20px; border-radius:8px; color:#fff;">
      <h2>Select Species</h2>
      <input type="text" id="speciesSearch" placeholder="Search by name or code" oninput="updateSpeciesList(this.value)" />
      <ul id="speciesList" style="list-style:none; padding-left: 0; max-height: 300px; overflow-y: auto;"></ul>
      <div style="margin-top: 10px;">
        <button onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;

  container.style.display = 'none';
  container.style.position = 'absolute';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.zIndex = 3000;
}

// Inject on load
document.addEventListener('DOMContentLoaded', () => {
  injectSurveyModal();
  injectSpeciesModal();
});

// Expose functions globally
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.openSurveyModal = openSurveyModal;
window.closeSurveyModal = closeSurveyModal;
window.updateTable = updateTable;
