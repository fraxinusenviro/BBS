function exportSpeciesCSV() {
  const headers = [
    'PROJECT_ID', 'POINT_ID', 'OBSERVER', 'SPECIES', 'SP_Count', 'BREEDING',
    'RANGE', 'BEARING', 'OBS_TIMESTAMP', 'SURVEY_TYPE', 'SURVEY_LENGTH',
    'WIND', 'PRECIP', 'NOTE'
  ];

  let rows = [headers];

  speciesMarkers.forEach(m => {
    if (!m) return;
    rows.push([
      m.projectID || '',
      m.pointID || '',
      m.observer || '',
      m.code || '',
      m.count || '',
      m.breeding || '',
      m.range || '',
      m.bearing || '',
      m.timestamp || '',
      m.surveyType || '',
      m.surveyLength || '',
      m.wind || '',
      m.precip || '',
      m.note || ''
    ]);
  });

  const csv = rows.map(row => row.map(val => `"${val}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "species_data.csv";
  a.click();
}

function exportSpeciesGeoJSON() {
  const features = speciesMarkers.filter(Boolean).map(m => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [m.marker.getLatLng().lng, m.marker.getLatLng().lat]
    },
    properties: {
      PROJECT_ID: m.projectID || '',
      POINT_ID: m.pointID || '',
      OBSERVER: m.observer || '',
      SPECIES: m.code || '',
      SP_Count: m.count || '',
      BREEDING: m.breeding || '',
      RANGE: m.range || '',
      BEARING: m.bearing || '',
      OBS_TIMESTAMP: m.timestamp || '',
      SURVEY_TYPE: m.surveyType || '',
      SURVEY_LENGTH: m.surveyLength || '',
      WIND: m.wind || '',
      PRECIP: m.precip || '',
      NOTE: m.note || ''
    }
  }));

  const geojson = {
    type: "FeatureCollection",
    features
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "species_data.geojson";
  a.click();
}
