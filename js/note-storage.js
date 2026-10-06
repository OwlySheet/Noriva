// NeckLab - Hear student links and settings

const noteUrlParams = new URLSearchParams(window.location.search);
const NOTE_STUDENT_MODE = noteUrlParams.has("student") || noteUrlParams.has("s");
const NOTE_STORAGE_KEY = "necklab_hear_settings";

const compactHearValues = {
exerciseType: ["note", "interval", "arpeggio", "chord", "scale", "rhythm"],
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
measureChange: document.getElementById("measureChange").value,
rhythmPatterns: [...document.querySelectorAll(".hearRhythmPatternOption:checked")].map(input => input.value)
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

function encodeShortNoteSettings(settings){
const qualityValues = [...document.querySelectorAll(".hearQualityOption")].map(input => input.value);
const intervalValues = [...document.querySelectorAll(".hearIntervalOption")].map(input => input.value);
const rhythmPatternValues = [...document.querySelectorAll(".hearRhythmPatternOption")].map(input => input.value);
const fields = [
[0, 2], [Math.max(0, Math.min(160, Number(settings.bpm) - 40)), 8],
[compactIndex(compactHearValues.exerciseType, settings.exerciseType), 3],
[settings.generationMode === "diatonic" ? 1 : 0, 1],
[settings.harmonyMode === "harmonized" ? 1 : 0, 1],
[settings.showHearDegree ? 1 : 0, 1],
[compactMask(qualityValues, settings.qualities), 13],
[compactMask(intervalValues, settings.intervals), 13],
[compactIndex(compactHearValues.root, settings.root), 4],
[compactIndex(compactHearValues.mode, settings.mode), 5],
[Math.max(0, Math.min(7, Number(settings.minOctave))), 3],
[Math.max(0, Math.min(7, Number(settings.maxOctave))), 3],
[compactIndex(compactHearValues.instrument, settings.instrument), 2],
[settings.noteNameFormat === "solfege" ? 1 : 0, 1],
[compactIndex(compactHearValues.measureChange, settings.measureChange), 2],
[compactIndex(compactHearValues.direction, settings.direction), 2],
[compactMask(rhythmPatternValues, settings.rhythmPatterns || rhythmPatternValues), 15]
];
const bytes = [];
let byte = 0;
let bitCount = 0;
fields.forEach(([fieldValue, width]) => {
let value = fieldValue;
let remaining = width;
while(remaining){
const take = Math.min(8 - bitCount, remaining);
byte |= (value & ((1 << take) - 1)) << bitCount;
value >>>= take;
bitCount += take;
remaining -= take;
if(bitCount === 8){ bytes.push(byte); byte = 0; bitCount = 0; }
}
});
if(bitCount) bytes.push(byte);
return "x" + btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeShortNoteSettings(encoded){
try {
const base64 = encoded.slice(1).replace(/-/g, "+").replace(/_/g, "/");
const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
let byteIndex = 0;
let bitCount = 0;
function read(width){
let value = 0;
let shift = 0;
while(width){
if(byteIndex >= bytes.length) throw new Error("Configuration incomplète");
const take = Math.min(8 - bitCount, width);
value |= ((bytes[byteIndex] >> bitCount) & ((1 << take) - 1)) << shift;
bitCount += take;
if(bitCount === 8){ byteIndex++; bitCount = 0; }
shift += take;
width -= take;
}
return value;
}
const version = read(2);
if(![0, 3].includes(version)) return null;
const qualityValues = [...document.querySelectorAll(".hearQualityOption")].map(input => input.value);
const intervalValues = [...document.querySelectorAll(".hearIntervalOption")].map(input => input.value);
const rhythmPatternValues = [...document.querySelectorAll(".hearRhythmPatternOption")].map(input => input.value);
const config = {
bpm: String(read(8) + 40),
exerciseType: compactHearValues.exerciseType[read(3)] || "note",
generationMode: read(1) ? "diatonic" : "chromatic",
harmonyMode: read(1) ? "harmonized" : "free",
showHearDegree: Boolean(read(1)),
qualities: expandMask(qualityValues, read(13)),
intervals: expandMask(intervalValues, read(13)),
root: compactHearValues.root[read(4)] || "C",
mode: compactHearValues.mode[read(5)] || "Majeur/Ionien",
minOctave: String(Math.max(1, Math.min(5, read(3)))),
maxOctave: String(Math.max(2, Math.min(6, read(3)))),
instrument: compactHearValues.instrument[read(2)] || "guitar",
noteNameFormat: read(1) ? "solfege" : "letter",
measureChange: compactHearValues.measureChange[read(2)] || "4",
direction: compactHearValues.direction[read(2)] || "ascending"
};
config.rhythmPatterns = version === 0
? expandMask(rhythmPatternValues, read(15))
: rhythmPatternValues;
return config;
} catch(error) {
return null;
}
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
if(compact) return compact.startsWith("x") ? decodeShortNoteSettings(compact) : decodeCompactNoteSettings(compact);

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

if(settings.rhythmPatterns){
document.querySelectorAll(".hearRhythmPatternOption").forEach(input => {
input.checked = settings.rhythmPatterns.includes(input.value);
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
url.searchParams.set("s", encodeShortNoteSettings(getNoteSettings()));
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
