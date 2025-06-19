// surveyGlobals.js

// --- Load from localStorage, or default to empty string
export let projectID    = localStorage.getItem('projectID')    || "";
export let pointID      = localStorage.getItem('pointID')      || "";
export let observer     = localStorage.getItem('observer')     || "";
export let surveyType   = localStorage.getItem('surveyType')   || "";
export let surveyLength = localStorage.getItem('surveyLength') || "";
export let wind         = localStorage.getItem('wind')         || "";
export let windDir      = localStorage.getItem('windDir')      || "";
export let tempC        = localStorage.getItem('tempC')        || "";
export let precip       = localStorage.getItem('precip')       || "";
export let siteHabitat  = localStorage.getItem('siteHabitat')  || "";

// --- Metadata Setter (same signature) ---
export function setSurveyMetadata(data) {
  projectID    = data.projectID    || "";
  pointID      = data.pointID      || "";
  observer     = data.observer     || "";
  surveyType   = data.surveyType   || "";
  surveyLength = data.surveyLength || "";
  wind         = data.wind         || "";
  windDir      = data.windDir      || "";
  tempC        = data.tempC        || "";
  precip       = data.precip       || "";
  siteHabitat  = data.siteHabitat  || "";

  // persist to localStorage
  localStorage.setItem('projectID',    projectID);
  localStorage.setItem('pointID',      pointID);
  localStorage.setItem('observer',     observer);
  localStorage.setItem('surveyType',   surveyType);
  localStorage.setItem('surveyLength', surveyLength);
  localStorage.setItem('wind',         wind);
  localStorage.setItem('windDir',      windDir);
  localStorage.setItem('tempC',        tempC);
  localStorage.setItem('precip',       precip);
  localStorage.setItem('siteHabitat',  siteHabitat);
}
