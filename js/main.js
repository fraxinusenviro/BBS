// js/main.js

import './storageData.js';
import './storage.js';
import './ui.js';
import './modal.js';
import './species.js';
import './export.js';
import './map.js';

import { adjustCount, saveSpeciesObservation, updateSpeciesList } from './species.js';
import { closeModal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalBackdrop')?.addEventListener('click', closeModal);
  document.getElementById('speciesSearch')?.addEventListener('input', e => {
    updateSpeciesList(e.target.value);
  });
  //document.getElementById('countPlus')?.addEventListener('click', () => adjustCount(1));
  //document.getElementById('countMinus')?.addEventListener('click', () => adjustCount(-1));
  document.getElementById('speciesSaveButton')?.addEventListener('click', saveSpeciesObservation);
});