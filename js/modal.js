import { updateSpeciesList, adjustCount, saveSpeciesObservation } from './species.js';
import { observer, pointID } from './surveyGlobals.js';

let placingPoint = false;
let currentLatLng = null;

/**
 * Displays the species modal for the given lat/lng, if metadata is filled in.
 */
function showSpeciesModal(latlng) {
  if (!observer || !pointID) {
    alert("Please complete metadata input before placing observations.");
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
window.showInstructions = showInstructions;
window.closeInstructions = closeInstructions;

//App Instructions
function showInstructions() {
  document.getElementById('instructionsModal')?.style.setProperty('display', 'block');
  document.getElementById('modalBackdrop')?.style.setProperty('display', 'block');
}

function closeInstructions() {
  document.getElementById('instructionsModal')?.style.setProperty('display', 'none');
  document.getElementById('modalBackdrop')?.style.setProperty('display', 'none');
}

// Optional: ESC key closes instructions
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeInstructions();
});

// 🔁 Wait for DOM to bind elements
document.addEventListener('DOMContentLoaded', () => {
  const plus = document.getElementById('countPlus');
  const minus = document.getElementById('countMinus');

  if (plus && !plus.dataset.bound) {
    plus.addEventListener('click', () => adjustCount(1));
    plus.dataset.bound = 'true';
  }

  if (minus && !minus.dataset.bound) {
    minus.addEventListener('click', () => adjustCount(-1));
    minus.dataset.bound = 'true';
  }

  const saveButton = document.getElementById('speciesSaveButton');
  if (saveButton && !saveButton.dataset.bound) {
    saveButton.addEventListener('click', saveSpeciesObservation);
    saveButton.dataset.bound = 'true';
  }

  const searchInput = document.getElementById('speciesSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      updateSpeciesList(e.target.value);
    });
  }

  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeModal);
});