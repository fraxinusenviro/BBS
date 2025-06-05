// storage.js — handles persistence of species markers using IndexedDB

import { updateTable } from './ui.js';
import { map } from './map.js';
import { deleteMarker } from './ui.js';
import { speciesMarkers } from './storageData.js';
import { createSpeciesPopupHTML } from './species.js'; // Popup generator

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
        radius: 6,
        color: data.soci ? 'red' : 'green',
        fillColor: 'black',
        fillOpacity: 0.6,
        weight: 2
      }).addTo(map);

      const label = L.divIcon({
        className: 'DBmarker-label',
		  //color: black,
        html: `${data.code} (${data.count})`,
        iconAnchor: [0, 10]
      });

      const labelMarker = L.marker([latlng.lat, latlng.lng + 0.0001], { icon: label }).addTo(map);

      const popup = createSpeciesPopupHTML(
        index,
        data.code,
        data.count,
        data.breeding || '',
        data.note || '',
        data.passHt || '',
        data.flightDir || ''
      );

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
        timestamp: marker.timestamp,
        passHt: marker.passHt || '',
        flightDir: marker.flightDir || ''
      };
      store.add(data);
    });
  };

  clearRequest.onerror = e => {
    console.error("Failed to clear IndexedDB before saving:", e.target.error);
  };
}