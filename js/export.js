import { speciesMarkers } from './storageData.js';

// Export as CSV
export function exportSpeciesCSV() {
  const headers = [
    'PROJECT_ID', 'POINT_ID', 'OBSERVER', 'SURVEY_TYPE', 'SURVEY_LENGTH',
    'WIND', 'WIND_DIR', 'TEMP_C', 'PRECIP', 'SITE_HABITAT',
    'SPECIES', 'SP_Count', 'RANGE', 'BEARING', 'PASS_HT', 'FLIGHT_DIR', 'NOTE', 'OBS_TIMESTAMP'
  ];

  const rows = [headers];

  speciesMarkers.forEach(m => {
    if (!m) return;
    rows.push([
      m.projectID || '',
      m.pointID || '',
      m.observer || '',
      m.surveyType || '',
      m.surveyLength || '',
      m.wind || '',
      m.windDir || '',
      m.tempC || '',
      m.precip || '',
      m.siteHabitat || '',
      m.code || '',
      m.count || '',
      m.range || '',
      m.bearing || '',
      m.passHt || '',
      m.flightDir || '',
      m.note || '',
      m.timestamp || ''
    ]);
  });

  const csv = rows.map(row => row.map(val => `"${val}"`).join(',')).join('\n');
  triggerDownload(csv, 'species_data.csv', 'text/csv');
}

// Export as GeoJSON
export function exportSpeciesGeoJSON() {
  const features = speciesMarkers.filter(m => m?.marker?.getLatLng).map(m => {
    const latlng = m.marker.getLatLng();
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [latlng.lng, latlng.lat]
      },
      properties: {
        PROJECT_ID: m.projectID || '',
        POINT_ID: m.pointID || '',
        OBSERVER: m.observer || '',
        SURVEY_TYPE: m.surveyType || '',
        SURVEY_LENGTH: m.surveyLength || '',
        WIND: m.wind || '',
        WIND_DIR: m.windDir || '',
        TEMP_C: m.tempC || '',
        PRECIP: m.precip || '',
        SITE_HABITAT: m.siteHabitat || '',
        SPECIES: m.code || '',
        SP_Count: m.count || '',
        RANGE: m.range || '',
        BEARING: m.bearing || '',
        PASS_HT: m.passHt || '',
        FLIGHT_DIR: m.flightDir || '',
        NOTE: m.note || '',
        OBS_TIMESTAMP: m.timestamp || ''
      }
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features
  };

  triggerDownload(JSON.stringify(geojson, null, 2), 'species_data.geojson', 'application/json');
}

// Export as KML
export function exportSpeciesKML() {
  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document><name>Species Observations</name>`;

  const kmlFooter = `</Document></kml>`;

  const placemarks = speciesMarkers.filter(m => m?.marker?.getLatLng).map(m => {
    const latlng = m.marker.getLatLng();
    const name = m.code || 'Species';
    const description = `
      <b>Observer:</b> ${m.observer || ''}<br/>
      <b>Species:</b> ${m.code || ''}<br/>
      <b>Count:</b> ${m.count || ''}<br/>
      <b>Breeding:</b> ${m.breeding || ''}<br/>
      <b>Survey Type:</b> ${m.surveyType || ''}<br/>
      <b>Survey Length:</b> ${m.surveyLength || ''}<br/>
      <b>Wind:</b> ${m.wind || ''}<br/>
      <b>Wind Dir:</b> ${m.windDir || ''}<br/>
      <b>Temp:</b> ${m.tempC || ''}<br/>
      <b>Precip:</b> ${m.precip || ''}<br/>
      <b>Habitat:</b> ${m.siteHabitat || ''}<br/>
      <b>Range:</b> ${m.range || ''}<br/>
      <b>Bearing:</b> ${m.bearing || ''}<br/>
      <b>Pass Ht:</b> ${m.passHt || ''}<br/>
      <b>Flight Dir:</b> ${m.flightDir || ''}<br/>
      <b>Note:</b> ${m.note || ''}<br/>
      <b>Timestamp:</b> ${m.timestamp || ''}
    `.trim();

    return `
      <Placemark>
        <name>${name}</name>
        <description><![CDATA[${description}]]></description>
        <Point><coordinates>${latlng.lng},${latlng.lat},0</coordinates></Point>
      </Placemark>
    `;
  }).join('\n');

  const kmlContent = `${kmlHeader}\n${placemarks}\n${kmlFooter}`;
  triggerDownload(kmlContent, 'species_data.kml', 'application/vnd.google-earth.kml+xml');
}

// Utility to trigger file download
function triggerDownload(content, filename, type) {
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.fileExport) {
    window.webkit.messageHandlers.fileExport.postMessage({
      filename: filename,
      mime: type,
      content: content
    });
  } else {
    console.warn("Native file export handler not available.");
  }
}
