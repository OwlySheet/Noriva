// NeckLab - Hear exercise generator

const chromaticPitchClasses = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chordIntervals = {
Maj: [0, 4, 7], min: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11],
m7: [0, 3, 7, 10], mMaj7: [0, 3, 7, 11], "maj7#5": [0, 4, 8, 11], dim: [0, 3, 6], dim7: [0, 3, 6, 9],
"m7♭5": [0, 3, 6, 10], m7b5: [0, 3, 6, 10], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7]
};

const hearIntervals = [
{ semitones: 0, label: "Unisson" },
{ semitones: 1, label: "Seconde mineure" },
{ semitones: 2, label: "Seconde majeure" },
{ semitones: 3, label: "Tierce mineure" },
{ semitones: 4, label: "Tierce majeure" },
{ semitones: 5, label: "Quarte juste" },
{ semitones: 6, label: "Triton" },
{ semitones: 7, label: "Quinte juste" },
{ semitones: 8, label: "Sixte mineure" },
{ semitones: 9, label: "Sixte majeure" },
{ semitones: 10, label: "Septième mineure" },
{ semitones: 11, label: "Septième majeure" },
{ semitones: 12, label: "Octave juste" }
];

let currentExercise = null;
let noteAudioContext;
let previousExerciseIdentities = [];
let hearAwaitingNext = false;
let hearAnswerTimer = null;

function randomItem(items){ return items[Math.floor(Math.random() * items.length)]; }
function randomOctave(minimum, maximum){ return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum; }
function getNoteMode(){ return document.querySelector('input[name="noteGenerationMode"]:checked').value; }
function getExerciseType(){ return document.getElementById("hearExerciseType").value; }
function getHearDirection(){ return document.querySelector('input[name="hearDirection"]:checked')?.value || "ascending"; }

function formatHearPitch(pitch){
if(document.getElementById("noteNameFormat")?.value !== "solfege") return pitch;
return pitch.replace(/^C/, "Do").replace(/^D/, "Ré").replace(/^E/, "Mi").replace(/^F/, "Fa").replace(/^G/, "Sol").replace(/^A/, "La").replace(/^B/, "Si");
}

function getHearAnswer(exercise){
if(exercise.type === "interval") return exercise.label;
if(exercise.type === "scale") return exercise.notes.map(note => formatHearPitch(note.pitch)).join(" · ");
if(exercise.type === "chord") {
const chordName = formatHearPitch(exercise.label.split(" ")[0]) + " " + exercise.label.split(" ").slice(1).join(" ");
const degree = exercise.degree && document.getElementById("showHearDegree")?.checked
? exercise.degree.replace(/[()]/g, "") + " · "
: "";
return degree + chordName + " — " + exercise.notes.map(note => formatHearPitch(note.pitch)).join(" · ");
}
return formatHearPitch(exercise.notes[0].pitch);
}

function exerciseIdentity(exercise){ return exercise.type + ":" + getHearAnswer(exercise); }

function hideHearAnswer(){
window.clearTimeout(hearAnswerTimer);
const answer = document.getElementById("hearAnswer");
answer.hidden = true;
answer.textContent = "";
}

function revealHearAnswer(){
if(!currentExercise) return;
const answer = document.getElementById("hearAnswer");
answer.textContent = getHearAnswer(currentExercise);
answer.hidden = false;
}

function selectedHearQualities(){
return [...document.querySelectorAll(".hearQualityOption:checked")].map(input => input.value);
}

function selectedHearIntervals(){
return [...document.querySelectorAll(".hearIntervalOption:checked")].map(input => Number(input.value));
}

function updateHearControls(){
if(typeof clearLongExerciseTimer === "function") clearLongExerciseTimer();
const exerciseType = getExerciseType();
const isHarmony = ["arpeggio", "chord"].includes(exerciseType);
const needsScale = getNoteMode() === "diatonic" || exerciseType === "scale" || (isHarmony && document.querySelector('input[name="hearHarmonyMode"]:checked').value === "harmonized");

document.getElementById("hearHarmonySettings").hidden = !isHarmony;
document.getElementById("hearIntervalSettings").hidden = exerciseType !== "interval";
document.getElementById("hearDirectionSettings").hidden = !["interval", "arpeggio", "scale"].includes(exerciseType);
document.getElementById("noteDiatonicSettings").hidden = !needsScale;
document.getElementById("hearExerciseLabel").textContent = {
note: "ÉCOUTE ET RETROUVE LA NOTE",
interval: "ÉCOUTE ET RETROUVE L'INTERVALLE",
arpeggio: "ÉCOUTE ET RETROUVE L'ARPÈGE",
chord: "ÉCOUTE ET RETROUVE L'ACCORD",
scale: "ÉCOUTE ET RETROUVE LA GAMME"
}[exerciseType];
currentExercise = null;
}

function createNoteHeight(){
const minimum = Number(document.getElementById("minOctave").value);
const maximum = Number(document.getElementById("maxOctave").value);
const low = Math.min(minimum, maximum);
const high = Math.max(minimum, maximum);
const notePool = getNoteMode() === "diatonic"
? getScale(document.getElementById("noteRootSelect").value, document.getElementById("noteModeSelect").value)
: chromaticPitchClasses;
const pitch = randomItem(notePool);
const octave = randomOctave(low, high);
return { pitch, octave, midi: (octave + 1) * 12 + getPitchClass(pitch) };
}

function createIntervalExercise(){
const minimum = Number(document.getElementById("minOctave").value);
const maximum = Number(document.getElementById("maxOctave").value);
const lowMidi = (Math.min(minimum, maximum) + 1) * 12;
const highMidi = (Math.max(minimum, maximum) + 1) * 12 + 11;
const choices = selectedHearIntervals();
const interval = hearIntervals.find(item => item.semitones === randomItem(choices.length ? choices : hearIntervals.map(item => item.semitones))) || hearIntervals[2];
const availableStarts = [];
for(let midi = lowMidi; midi + interval.semitones <= highMidi; midi++) availableStarts.push(midi);
const startMidi = randomItem(availableStarts);
const makeNote = midi => ({ pitch: sharpNotes[midi % 12], octave: Math.floor(midi / 12) - 1, midi });
const notes = [makeNote(startMidi), makeNote(startMidi + interval.semitones)];
if(getHearDirection() === "descending" || (getHearDirection() === "mixed" && Math.random() < .5)) notes.reverse();
return { type: "interval", notes, label: interval.label };
}

function chordLetterOffsets(quality, count){
if(quality === "sus2") return [0, 1, 4].slice(0, count);
if(quality === "sus4") return [0, 3, 4].slice(0, count);
return [0, 2, 4, 6].slice(0, count);
}

function spellChordTones(root, quality, rootMidi){
const intervals = chordIntervals[quality] || chordIntervals.Maj;
const rootLetterIndex = noteLetters.indexOf(root[0]);
const rootPitch = getPitchClass(root);
const letters = chordLetterOffsets(quality, intervals.length);
return intervals.map((interval, index) => {
const letter = noteLetters[(rootLetterIndex + letters[index]) % noteLetters.length];
return {
pitch: spellNote(letter, (rootPitch + interval) % 12),
octave: Math.floor((rootMidi + interval) / 12) - 1,
midi: rootMidi + interval
};
});
}

function createChordExercise(){
const minimum = Number(document.getElementById("minOctave").value);
const maximum = Number(document.getElementById("maxOctave").value);
const octave = randomOctave(Math.min(minimum, maximum), Math.max(minimum, maximum));
const root = document.getElementById("noteRootSelect").value;
const scaleMode = document.getElementById("noteModeSelect").value;
const harmonized = document.querySelector('input[name="hearHarmonyMode"]:checked').value === "harmonized";
let pitch;
let quality;
let chordDegree = "";

if(harmonized){
const scale = getScale(root, scaleMode);
const degreeIndex = Math.floor(Math.random() * scale.length);
const chord = buildDiatonicChords(scale, scaleMode)[degreeIndex];
pitch = scale[degreeIndex];
quality = chord.quality;
chordDegree = chord.degree;
} else {
const pool = getNoteMode() === "diatonic" ? getScale(root, scaleMode) : chromaticPitchClasses;
pitch = randomItem(pool);
quality = randomItem(selectedHearQualities() || Object.keys(chordIntervals));
}

const rootMidi = (octave + 1) * 12 + getPitchClass(pitch);
return {
type: "chord",
notes: spellChordTones(pitch, quality, rootMidi),
label: pitch + " " + formatChordQuality(quality),
degree: chordDegree
};
}

function createScaleExercise(){
const root = document.getElementById("noteRootSelect").value;
const mode = document.getElementById("noteModeSelect").value;
const octave = Number(document.getElementById("minOctave").value);
const rootMidi = (octave + 1) * 12 + getPitchClass(root);
const scale = getScale(root, mode);
const notes = [...scale, root].map((pitch, index) => {
const midi = index === 7 ? rootMidi + 12 : rootMidi + getPitchClass(pitch) - getPitchClass(root) + (getPitchClass(pitch) < getPitchClass(root) ? 12 : 0);
return { pitch, octave: Math.floor(midi / 12) - 1, midi };
});
if(getHearDirection() === "descending" || (getHearDirection() === "mixed" && Math.random() < .5)) notes.reverse();
return {
type: "scale",
notes,
label: root + " " + mode
};
}

function getAudioContext(){
if(!noteAudioContext){
noteAudioContext = new AudioContext();
}
if(noteAudioContext.state === "suspended") noteAudioContext.resume();
return noteAudioContext;
}

function playPartial(context, start, frequency, ratio, amplitude, duration, type = "sine"){
const oscillator = context.createOscillator();
const gain = context.createGain();
oscillator.type = type;
oscillator.frequency.value = frequency * ratio;
gain.gain.setValueAtTime(0.0001, start);
gain.gain.exponentialRampToValueAtTime(amplitude, start + 0.012);
gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
oscillator.connect(gain); gain.connect(context.destination);
oscillator.start(start); oscillator.stop(start + duration + 0.03);
}

function playFormant(context, start, frequency, formant, amplitude, duration){
const oscillator = context.createOscillator();
const filter = context.createBiquadFilter();
const gain = context.createGain();
oscillator.type = "sawtooth";
oscillator.frequency.value = frequency;
filter.type = "bandpass";
filter.frequency.value = formant;
filter.Q.value = 7;
gain.gain.setValueAtTime(0.0001, start);
gain.gain.exponentialRampToValueAtTime(amplitude, start + 0.06);
gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
oscillator.connect(filter); filter.connect(gain); gain.connect(context.destination);
oscillator.start(start); oscillator.stop(start + duration + 0.04);
}

function playAttackNoise(context, start, amount){
const buffer = context.createBuffer(1, context.sampleRate * 0.035, context.sampleRate);
const data = buffer.getChannelData(0);
const source = context.createBufferSource();
const gain = context.createGain();
for(let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * amount;
source.buffer = buffer;
gain.gain.setValueAtTime(0.12, start);
gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.035);
source.connect(gain); gain.connect(context.destination); source.start(start);
}

function playTone(note, start, duration = 1.2){
const context = getAudioContext();
const frequency = 440 * Math.pow(2, (note.midi - 69) / 12);
const instrument = document.getElementById("instrumentSelect").value;
if(instrument === "piano"){
playAttackNoise(context, start, 0.07);
playPartial(context, start, frequency, 1, 0.42, Math.min(Math.max(duration * 5, 3.2), 5.8), "triangle");
playPartial(context, start, frequency, 2, 0.16, Math.min(Math.max(duration * 3.3, 2.1), 3.6), "sine");
playPartial(context, start, frequency, 3, 0.08, Math.min(Math.max(duration * 2.2, 1.25), 2.2), "sine");
playPartial(context, start, frequency, 4, 0.035, Math.min(Math.max(duration * 1.5, .75), 1.3), "sine");
return;
}
if(instrument === "marimba"){
playAttackNoise(context, start, 0.16);
playPartial(context, start, frequency, 1, 0.38, Math.min(duration, 1.05));
playPartial(context, start, frequency, 3.9, 0.15, Math.min(duration, 0.42));
playPartial(context, start, frequency, 10.8, 0.055, Math.min(duration, 0.2));
return;
}
if(instrument === "voice"){
playFormant(context, start, frequency, 650, 0.17, Math.min(duration * 1.4, 1.8));
playFormant(context, start, frequency, 1100, 0.12, Math.min(duration * 1.2, 1.5));
playFormant(context, start, frequency, 2450, 0.055, Math.min(duration, 1.1));
return;
}
playAttackNoise(context, start, 0.32);
playPartial(context, start, frequency, 1, 0.27, Math.min(duration, 1.25), "triangle");
playPartial(context, start, frequency, 2, 0.085, Math.min(duration, 0.62), "triangle");
playPartial(context, start, frequency, 3, 0.035, Math.min(duration, 0.38), "sine");
playPartial(context, start + 0.008, frequency * 1.002, 1, 0.045, Math.min(duration, 0.72), "triangle");
}

function playExercise(exercise){
const context = getAudioContext();
const start = context.currentTime + 0.03;
const beatDuration = 60 / bpm;
if(exercise.type === "chord" && getExerciseType() === "chord"){
const chordDuration = beatDuration * 1.9;
exercise.notes.forEach(note => playTone(note, start, chordDuration));
return Math.max(chordDuration, document.getElementById("instrumentSelect").value === "piano" ? 3.2 : chordDuration);
}
const noteDuration = beatDuration * 0.82;
exercise.notes.forEach((note, index) => playTone(note, start + index * beatDuration, noteDuration));
const resonance = document.getElementById("instrumentSelect").value === "piano" ? 3.2 : noteDuration;
return Math.max(noteDuration, (exercise.notes.length - 1) * beatDuration + resonance);
}

function isLongHearExercise(){
return ["scale", "arpeggio"].includes(getExerciseType());
}

let longExerciseTimer = null;

function clearLongExerciseTimer(){
window.clearTimeout(longExerciseTimer);
longExerciseTimer = null;
}

function scheduleLongExercise(duration){
if(!metronomeRunning || !isLongHearExercise()) return;

clearLongExerciseTimer();
// La réponse n'apparaît qu'après le nombre de mesures choisi, puis une pulsation
// de silence laisse le temps de la lire avant l'exercice suivant.
const barDuration = (60 / bpm) * 4;
const measureWait = barDuration * Math.max(1, measureLimit);
const answerStartWait = Math.ceil((duration + measureWait) / barDuration) * barDuration;
longExerciseTimer = window.setTimeout(()=>{
revealHearAnswer();
hearAwaitingNext = true;
const answerDuration = playExercise(currentExercise);
hearAnswerTimer = window.setTimeout(()=>{
hearAwaitingNext = false;
generateAndPlay();
}, Math.ceil(answerDuration / barDuration) * barDuration * 1000);
}, answerStartWait * 1000);
}

function generateAndPlay(){
clearLongExerciseTimer();
hideHearAnswer();
const type = getExerciseType();
let candidate;
for(let attempt = 0; attempt < 12; attempt++){
candidate = type === "note" ? { type: "note", notes: [createNoteHeight()] } : type === "interval" ? createIntervalExercise() : type === "scale" ? createScaleExercise() : createChordExercise();
if(type === "arpeggio" && (getHearDirection() === "descending" || (getHearDirection() === "mixed" && Math.random() < .5))) candidate.notes.reverse();
const identity = exerciseIdentity(candidate);
if(!(previousExerciseIdentities.length >= 2 && previousExerciseIdentities.slice(-2).every(item => item === identity))) break;
}
currentExercise = candidate;
previousExerciseIdentities.push(exerciseIdentity(currentExercise));
previousExerciseIdentities = previousExerciseIdentities.slice(-2);
const duration = playExercise(currentExercise);
scheduleLongExercise(duration);
}

function replayCurrentExercise(){
if(!currentExercise) generateAndPlay();
else {
clearLongExerciseTimer();
hideHearAnswer();
hearAwaitingNext = false;
answerMeasuresRemaining = 0;
const duration = playExercise(currentExercise);
scheduleLongExercise(duration);
}
}

let currentMeasure = 0;
let measureLimit = Number(document.getElementById("measureChange").value);
let skipFirstMeasure = false;
let answerMeasuresRemaining = 0;
function setMeasureLimit(value){ measureLimit = Number(value); currentMeasure = 0; answerMeasuresRemaining = 0; }
function nextMeasure(){
if(isLongHearExercise()) return;
if(skipFirstMeasure){ skipFirstMeasure = false; return; }
if(hearAwaitingNext){
answerMeasuresRemaining--;
if(answerMeasuresRemaining <= 0){
hearAwaitingNext = false;
generateAndPlay();
}
return;
}
currentMeasure++;
if(currentMeasure >= measureLimit){
currentMeasure = 0;
hearAwaitingNext = true;
revealHearAnswer();
const answerDuration = playExercise(currentExercise);
answerMeasuresRemaining = Math.max(1, Math.ceil(answerDuration / ((60 / bpm) * 4)));
}
}
function onMetronomeStart(){ skipFirstMeasure = true; hearAwaitingNext = false; answerMeasuresRemaining = 0; generateAndPlay(); }
function onMetronomeStop(){ clearLongExerciseTimer(); window.clearTimeout(hearAnswerTimer); hearAwaitingNext = false; answerMeasuresRemaining = 0; }

document.getElementById("replayNote").addEventListener("click", replayCurrentExercise);
document.getElementById("measureChange").addEventListener("change", event => setMeasureLimit(event.target.value));
document.getElementById("hearExerciseType").addEventListener("change", updateHearControls);
document.querySelectorAll('input[name="noteGenerationMode"], input[name="hearHarmonyMode"]').forEach(input => input.addEventListener("change", updateHearControls));
document.querySelectorAll("#noteRootSelect, #noteModeSelect, #minOctave, #maxOctave, #instrumentSelect, #noteNameFormat, #showHearDegree, .hearQualityOption, .hearIntervalOption, input[name=\"hearDirection\"]").forEach(control => control.addEventListener("change", ()=>{
currentExercise = null;
previousExerciseIdentities = [];
clearLongExerciseTimer();
hideHearAnswer();
}));

const bpmSlider = document.getElementById("bpm");
const bpmValue = document.getElementById("bpmValue");
const metroButton = document.getElementById("metroButton");
bpmSlider.addEventListener("input", ()=>{ setBpm(Number(bpmSlider.value)); bpmValue.textContent = bpmSlider.value + " BPM"; });
metroButton.addEventListener("click", ()=> metronomeRunning ? stopMetronome() : startMetronome());

qualities.forEach(quality => {
const label = document.createElement("label");
label.innerHTML = `<input class="hearQualityOption" type="checkbox" value="${quality}" checked> ${formatChordQuality(quality) || "Majeur"}`;
document.getElementById("hearQualitySettings").appendChild(label);
label.querySelector("input").addEventListener("change", ()=> currentExercise = null);
});

hearIntervals.forEach(interval => {
const label = document.createElement("label");
label.innerHTML = `<input class="hearIntervalOption" type="checkbox" value="${interval.semitones}" checked> ${interval.label}`;
document.getElementById("hearIntervalOptions").appendChild(label);
label.querySelector("input").addEventListener("change", ()=>{
currentExercise = null;
previousExerciseIdentities = [];
hideHearAnswer();
});
});

updateHearControls();
