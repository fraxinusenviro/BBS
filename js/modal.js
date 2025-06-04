import { updateSpeciesList, adjustCount, saveSpeciesObservation } from './species.js';
import { observer, pointID } from './surveyGlobals.js';

let placingPoint = false;
let currentLatLng = null;

/**
 * Displays the species modal for the given lat/lng, if metadata is filled in.
 */
function showSpeciesModal(latlng) {
  if (!observer || !pointID) {
    alert("Please enter both Survey Point ID and Observer before placing species.");
    return;
  }

  placingPoint = true;
  currentLatLng = latlng;

  const modal = document.getElementById('speciesModal');
  const backdrop = document.getElementById('modalBackdrop');
  if (!modal || !backdrop) return;

  // Reset modal fields safely
  const searchInput = document.getElementById('speciesSearch');
  const countDisplay = document.getElementById('speciesCountDisplay');
  const noteInput = document.getElementById('noteInput');
  const breedingInput = document.getElementById('breedingInput');

  if (searchInput) searchInput.value = '';
  if (countDisplay) countDisplay.textContent = '1';
  if (noteInput) noteInput.value = '';
  if (breedingInput) breedingInput.value = '';

  modal.style.display = 'block';
  backdrop.style.display = 'block';

  updateSpeciesList('');
}

/**
 * Closes the species modal and resets state.
 */
function closeModal() {
  placingPoint = false;
  currentLatLng = null;
  document.getElementById('speciesModal')?.style.setProperty('display', 'none');
  document.getElementById('modalBackdrop')?.style.setProperty('display', 'none');
}

/**
 * Returns whether a point is currently being placed.
 */
function isPlacingPoint() {
  return placingPoint;
}

export { showSpeciesModal, closeModal, currentLatLng, isPlacingPoint };

// For inline button onclicks
window.closeModal = closeModal;

// 🔁 Wait for DOM to bind elements
document.addEventListener('DOMContentLoaded', () => {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeModal);

  const searchInput = document.getElementById('speciesSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      updateSpeciesList(e.target.value);
    });
  }

  const plus = document.getElementById('countPlus');
  const minus = document.getElementById('countMinus');
  if (plus) plus.addEventListener('click', () => adjustCount(1));
  if (minus) minus.addEventListener('click', () => adjustCount(-1));

  const saveButton = document.getElementById('speciesSaveButton');
  if (saveButton) saveButton.addEventListener('click', saveSpeciesObservation);
});