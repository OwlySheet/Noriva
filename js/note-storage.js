// NeckLab - Hear student links and settings

const noteUrlParams = new URLSearchParams(window.location.search);
const NOTE_STUDENT_MODE = noteUrlParams.has("student") || noteUrlParams.has("s");
const NOTE_STORAGE_KEY = "necklab_hear_settings";

const compactHearValues = {
exerciseType: ["note", "interval", "arpeggio", "chord", "scale"],
direction: ["ascending", "descending", "mixed"],
root: ["C", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
mode: ["Majeur/Ionien", "Dorien", "Phrygien", "Lydien", "Mixolydien", "Mineur/Aeolien", "Locrien", "Ionien ♯5", "Dorien ♯4", "Phrygien dominant", "Lydien ♯2", "Ultra Locrien", "Mineur harmonique", "Locrien ♮6", "Lydien augmenté", "Lydien dominant", "Mixolydien ♭6", "Locrien ♮2", "Altéré", "Mineur mélodique", "Dorien ♭2"],
instrument: ["guitar", "piano", "marimba", "voice"],
measureChange: ["1", "2", "4"]
};

function getNoteSettings(){
return {
bpm: document.getElementById("bpm").value,
exerciseType: document.getElementById("hearExerciseType").value,
direction: document.querySelector('input[name="hearDirection"]:checked').value,
generationMode: document.querySelector('input[name="noteGenerationMode"]:checked').value,
harmonyMode: document.querySelector('input[name="hearHarmonyMode"]:checked').value,
showHearDegree: document.getElementById("showHearDegree").checked,
qualities: [...document.querySelectorAll(".hearQualityOption:checked")].map(input => input.value),
intervals: [...document.querySelectorAll(".hearIntervalOption:checked")].map(input => input.value),
root: document.getElementById("noteRootSelect").value,
mode: document.getElementById("noteModeSelect").value,
minOctave: document.getElementById("minOctave").value,
maxOctave: document.getElementById("maxOctave").value,
instrument: document.getElementById("instrumentSelect").value,
noteNameFormat: document.getElementById("noteNameFormat").value,
measureChange: document.getElementById("measureChange").value
};
}

function encodeNoteSettings(settings){
const bytes = new TextEncoder().encode(JSON.stringify(settings));
return btoa(String.fromCharCode(...bytes))
.replace(/\+/g, "-")
.replace(/\//g, "_")
.replace(/=+$/, "");
}

function compactIndex(values, value){ return Math.max(0, values.indexOf(value)); }

function compactMask(values, selected){
return values.reduce((mask, value, index) => selected.includes(value) ? mask | (1 << index) : mask, 0);
}

function expandMask(values, mask){
return values.filter((value, index) => mask & (1 << index));
}

function encodeCompactNoteSettings(settings){
const qualityValues = [...document.querySelectorAll(".hearQualityOption")].map(input => input.value);
const intervalValues = [...document.querySelectorAll(".hearIntervalOption")].map(input => input.value);
const values = [
2,
Number(settings.bpm),
compactIndex(compactHearValues.exerciseType, settings.exerciseType),
settings.generationMode === "diatonic" ? 1 : 0,
settings.harmonyMode === "harmonized" ? 1 : 0,
compactMask(qualityValues, settings.qualities),
compactMask(intervalValues, settings.intervals),
compactIndex(compactHearValues.root, settings.root),
compactIndex(compactHearValues.mode, settings.mode),
Number(settings.minOctave),
Number(settings.maxOctave),
compactIndex(compactHearValues.instrument, settings.instrument),
settings.noteNameFormat === "solfege" ? 1 : 0,
compactIndex(compactHearValues.measureChange, settings.measureChange),
compactIndex(compactHearValues.direction, settings.direction)
];
return values.map(value => value.toString(36)).join(".");
}

function decodeCompactNoteSettings(encoded){
try {
const values = encoded.split(".").map(value => Number.parseInt(value, 36));
if(![1, 2].includes(values[0]) || values.some(value => !Number.isFinite(value)) || values.length !== (values[0] === 1 ? 14 : 15)) return null;
const qualityValues = [...document.querySelectorAll(".hearQualityOption")].map(input => input.value);
const intervalValues = [...document.querySelectorAll(".hearIntervalOption")].map(input => input.value);
return {
bpm: String(Math.max(40, Math.min(200, values[1]))),
exerciseType: compactHearValues.exerciseType[values[2]] || "note",
generationMode: values[3] ? "diatonic" : "chromatic",
harmonyMode: values[4] ? "harmonized" : "free",
qualities: expandMask(qualityValues, values[5]),
intervals: expandMask(intervalValues, values[6]),
root: compactHearValues.root[values[7]] || "C",
mode: compactHearValues.mode[values[8]] || "Majeur/Ionien",
minOctave: String(Math.max(1, Math.min(5, values[9]))),
maxOctave: String(Math.max(2, Math.min(6, values[10]))),
instrument: compactHearValues.instrument[values[11]] || "guitar",
noteNameFormat: values[12] ? "solfege" : "letter",
measureChange: compactHearValues.measureChange[values[13]] || "4",
direction: values[0] === 2 ? (compactHearValues.direction[values[14]] || "ascending") : "ascending"
};
} catch(error) {
return null;
}
}

function decodeNoteSettings(){
const compact = noteUrlParams.get("s");
if(compact) return decodeCompactNoteSettings(compact);

const encoded = noteUrlParams.get("config");
if(!NOTE_STUDENT_MODE || !encoded) return null;

try {
const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), character => character.charCodeAt(0))));
} catch(error) {
console.warn("Lien élève invalide.", error);
return null;
}
}

function applyNoteSettings(settings){
if(!settings) return;

const modeRadio = document.querySelector(`input[name="noteGenerationMode"][value="${settings.generationMode}"]`);
if(modeRadio) modeRadio.checked = true;

const harmonyRadio = document.querySelector(`input[name="hearHarmonyMode"][value="${settings.harmonyMode}"]`);
if(harmonyRadio) harmonyRadio.checked = true;

const directionRadio = document.querySelector(`input[name="hearDirection"][value="${settings.direction || "ascending"}"]`);
if(directionRadio) directionRadio.checked = true;

if(typeof settings.showHearDegree === "boolean"){
document.getElementById("showHearDegree").checked = settings.showHearDegree;
}

[
[
"hearExerciseType", settings.exerciseType],
["noteRootSelect", settings.root],
["noteModeSelect", settings.mode],
["minOctave", settings.minOctave],
["maxOctave", settings.maxOctave],
["instrumentSelect", settings.instrument],
["noteNameFormat", settings.noteNameFormat],
["measureChange", settings.measureChange]
].forEach(([id, value]) => {
const control = document.getElementById(id);
if(control && value) control.value = value;
});

if(settings.qualities){
document.querySelectorAll(".hearQualityOption").forEach(input => {
input.checked = settings.qualities.includes(input.value);
});
}

if(settings.intervals){
document.querySelectorAll(".hearIntervalOption").forEach(input => {
input.checked = settings.intervals.includes(input.value);
});
}

const bpmSlider = document.getElementById("bpm");
if(settings.bpm && bpmSlider){
bpmSlider.value = settings.bpm;
document.getElementById("bpmValue").textContent = settings.bpm + " BPM";
setBpm(Number(settings.bpm));
}

setMeasureLimit(document.getElementById("measureChange").value);
updateHearControls();
}

function saveNoteSettings(){
if(!NOTE_STUDENT_MODE){
localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(getNoteSettings()));
}
}

function createNoteStudentLink(){
const url = new URL(window.location.href);
url.search = "";
url.hash = "";
url.searchParams.set("s", encodeCompactNoteSettings(getNoteSettings()));
return url.href;
}

function lockNoteStudentMode(){
if(!NOTE_STUDENT_MODE) return;
document.body.classList.add("student-mode");
document.getElementById("settingsGear").hidden = true;
}

const noteLinkButton = document.getElementById("createNoteStudentLink");
const noteLinkOutput = document.getElementById("noteStudentLinkOutput");
const noteCopyButton = document.getElementById("copyNoteStudentLink");
const hearSettingsGear = document.getElementById("settingsGear");
const hearSettingsPanel = document.querySelector(".note-settings");

hearSettingsGear.addEventListener("click", ()=>{
const isHidden = hearSettingsPanel.hidden;
hearSettingsPanel.hidden = !isHidden;
hearSettingsGear.setAttribute("aria-expanded", String(isHidden));
});

noteLinkButton.addEventListener("click", ()=>{
noteLinkOutput.value = createNoteStudentLink();
noteCopyButton.hidden = false;
noteCopyButton.textContent = "Copier le lien";
});

noteCopyButton.addEventListener("click", async ()=>{
noteLinkOutput.select();
try {
await navigator.clipboard.writeText(noteLinkOutput.value);
} catch(error) {
document.execCommand("copy");
}
noteCopyButton.textContent = "Lien copié";
});

document.querySelectorAll(".note-settings input, .note-settings select").forEach(control => {
control.addEventListener("change", saveNoteSettings);
});
document.getElementById("bpm").addEventListener("input", saveNoteSettings);

const sharedSettings = NOTE_STUDENT_MODE
? decodeNoteSettings()
: JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY) || "null");

applyNoteSettings(sharedSettings);
lockNoteStudentMode();
