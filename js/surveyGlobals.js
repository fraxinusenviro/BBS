// surveyGlobals.js

// Metadata Variables
export let projectID = "";
export let pointID = "";
export let observer = "";
export let surveyType = "";
export let surveyLength = "";
export let wind = "";
export let windDir = "";
export let tempC = "";
export let precip = "";
export let siteHabitat = "";

// Metadata Setter
export function setSurveyMetadata(data) {
  projectID = data.projectID || "";
  pointID = data.pointID || "";
  observer = data.observer || "";
  surveyType = data.surveyType || "";
  surveyLength = data.surveyLength || "";
  wind = data.wind || "";
  windDir = data.windDir || "";
  tempC = data.tempC || "";
  precip = data.precip || "";
  siteHabitat = data.siteHabitat || "";
}