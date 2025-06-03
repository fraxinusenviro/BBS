let placingPoint = false;
let currentLatLng = null;

// Show species modal at clicked location
function showSpeciesModal(latlng) {
  const observer = document.getElementById('observer')?.value.trim();
  const pointID = document.getElementById('pointID')?.value.trim();

  if (!observer || !pointID) {
    alert("Please enter both Survey Point ID and Observer before placing species.");
    return;
  }

  placingPoint = true;
  currentLatLng = latlng;

  const modal = document.getElementById('speciesModal');
  const backdrop = document.getElementById('modalBackdrop');

  if (!modal || !backdrop) {
    console.error("Modal or backdrop element not found in DOM.");
    return;
  }

  modal.style.display = 'block';
  backdrop.style.display = 'block';

  // Clear search input if it exists
  const searchInput = document.getElementById('speciesSearch');
  if (searchInput) searchInput.value = '';

  // Populate species list
  if (typeof updateSpeciesList === 'function') {
    updateSpeciesList('');
  } else {
    console.warn("updateSpeciesList function not available.");
  }
}

// Close modal (for cancel or after placing point)
function closeModal() {
  placingPoint = false;
  currentLatLng = null;

  const modal = document.getElementById('speciesModal');
  const backdrop = document.getElementById('modalBackdrop');

  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}

// Optional: ESC key to close modal
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Expose modal controls globally
window.showSpeciesModal = showSpeciesModal;
window.closeModal = closeModal;
