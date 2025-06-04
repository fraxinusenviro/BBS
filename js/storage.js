// storage.js — handles persistence of species markers using IndexedDB

import { updateTable } from './ui.js';
import { map } from './map.js'; // assuming `map` is exported
import { deleteMarker } from './ui.js'; // used in popup HTML
import { speciesMarkers } from './storageData.js'; // shared state array (see note below)


const DB_NAME = 'SpeciesSurveyDB';
const DB_VERSION = 1;
const STORE_NAME = 'speciesMarkers';

let db;

// Open or create the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = event => {
      db = event.target.result;
      resolve();
    };

    request.onupgradeneeded = event => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Save all speciesMarkers to IndexedDB
async function saveSpeciesMarkers() {
  if (!db) await openDatabase();

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const clearRequest = store.clear();
  clearRequest.onsuccess = () => {
    speciesMarkers.forEach(marker => {
      const plainMarker = {
        ...marker,
        latlng: { lat: marker.latlng.lat, lng: marker.latlng.lng }
      };
      delete plainMarker.marker;
      delete plainMarker.label;
      store.put(plainMarker);
    });
  };

  clearRequest.onerror = e => {
    console.error("Failed to clear store before saving:", e.target.error);
  };
}

// Load markers from IndexedDB and rehydrate onto map
export async function loadSpeciesMarkers() {
  if (!db) await openDatabase();

  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = () => {
    const results = request.result;
    results.forEach((data, index) => {
      const latlng = L.latLng(data.latlng.lat, data.latlng.lng);

      const marker = L.circleMarker(latlng, {
        radius: 10,
        color: data.soci ? 'red' : 'blue',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2
      }).addTo(map);

      const label = L.divIcon({
        className: 'marker-label',
        html: `${data.code} (${data.count})`,
        iconAnchor: [0, 10]
      });

      const labelMarker = L.marker([latlng.lat, latlng.lng + 0.0001], { icon: label }).addTo(map);

      const popup = document.createElement('div');
      popup.className = 'popup-content';
      popup.innerHTML = `
        <b>${data.code}</b><br>
        Count: <span id="count-${index}">${data.count}</span><br>
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
          <textarea id="note-${index}" rows="2" style="width:100%;">${data.note || ''}</textarea>
        </label><br>

        <button onclick="updateCount(${index})">Update</button>
        <button onclick="deleteMarker(${index})">❌</button>
      `;

      marker.bindPopup(popup);

      speciesMarkers.push({
        ...data,
        latlng,
        marker,
        label: labelMarker
      });
    });

    updateTable();
  };

  request.onerror = e => {
    console.error("Error loading markers:", e.target.error);
  };
}

// Save in-memory markers to IndexedDB
export function syncToIndexedDB() {
  if (!db) {
    openDatabase().then(() => syncToIndexedDB());
    return;
  }

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const clearRequest = store.clear();
  clearRequest.onsuccess = () => {
    speciesMarkers.forEach(marker => {
      const data = {
        code: marker.code,
        name: marker.name,
        soci: marker.soci,
        latlng: marker.latlng,
        observer: marker.observer,
        pointID: marker.pointID,
        projectID: marker.projectID,
        surveyType: marker.surveyType,
        surveyLength: marker.surveyLength,
        wind: marker.wind,
        precip: marker.precip,
        count: marker.count,
        breeding: marker.breeding,
        note: marker.note,
        range: marker.range,
        bearing: marker.bearing,
        timestamp: marker.timestamp
      };
      store.add(data);
    });
  };

  clearRequest.onerror = e => {
    console.error("Failed to clear IndexedDB before saving:", e.target.error);
  };
}