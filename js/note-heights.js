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
let selectedKonokolPatterns = [];
let hearNextRhythmTimer = null;
let hearRhythmAdvancing = false;
let previousSingleRhythmPatternId = null;
let hearRhythmDragPayload = null;
let hearRhythmIncorrectIndexes = new Set();

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
if(exercise.type === "rhythm") return exercise.patterns.map(pattern => pattern.label).join(" · ");
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
}

function revealHearAnswer(){
// Les exercices d'écoute restent sans révélation visuelle de la solution.
}

function selectedHearQualities(){
return [...document.querySelectorAll(".hearQualityOption:checked")].map(input => input.value);
}

function selectedHearIntervals(){
return [...document.querySelectorAll(".hearIntervalOption:checked")].map(input => Number(input.value));
}

function updateHearControls(){
if(typeof clearLongExerciseTimer === "function") clearLongExerciseTimer();
window.clearTimeout(hearNextRhythmTimer);
hearRhythmAdvancing = false;
const exerciseType = getExerciseType();
const listeningIcon = document.getElementById("listeningIcon");
if(listeningIcon){
listeningIcon.innerHTML = exerciseType === "rhythm"
? `<svg viewBox="0 0 96 96" role="presentation"><path d="M28 79h40L60 25H36z"/><path d="M48 25v42"/><path d="M48 40l15-12"/><circle cx="63" cy="28" r="4"/><path d="M23 79h50"/></svg>`
: "♫";
}
if(exerciseType !== "rhythm") selectedKonokolPatterns = [];
const isHarmony = ["arpeggio", "chord"].includes(exerciseType);
const needsScale = getNoteMode() === "diatonic" || exerciseType === "scale" || (isHarmony && document.querySelector('input[name="hearHarmonyMode"]:checked').value === "harmonized");

document.getElementById("hearHarmonySettings").hidden = !isHarmony;
document.getElementById("hearIntervalSettings").hidden = exerciseType !== "interval";
document.getElementById("hearDirectionSettings").hidden = !["interval", "arpeggio", "scale"].includes(exerciseType);
document.getElementById("hearVocalCheck").hidden = exerciseType !== "note";
document.getElementById("hearRhythmWriter").hidden = exerciseType !== "rhythm";
document.getElementById("hearRhythmSettings").hidden = exerciseType !== "rhythm";
document.getElementById("hearRhythmPatternSettings").hidden = exerciseType !== "rhythm";
document.getElementById("hearRhythmSelection").hidden = exerciseType !== "rhythm";
document.getElementById("noteDiatonicSettings").hidden = !needsScale;
document.getElementById("hearExerciseLabel").textContent = {
note: "ÉCOUTE ET RETROUVE LA NOTE",
interval: "ÉCOUTE ET RETROUVE L'INTERVALLE",
arpeggio: "ÉCOUTE ET RETROUVE L'ARPÈGE",
chord: "ÉCOUTE ET RETROUVE L'ACCORD",
scale: "ÉCOUTE ET RETROUVE LA GAMME",
rhythm: "TROUVE LE PATTERN"
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

function createRhythmExercise(){
const count = Number(document.getElementById("hearRhythmPatternCount").value);
const patternPool = getAvailableKonokolPatterns();
let patterns;
if(count === 1){
const nonRepeatingPool = patternPool.filter(pattern => pattern.id !== previousSingleRhythmPatternId);
const pattern = randomItem(nonRepeatingPool.length ? nonRepeatingPool : patternPool);
previousSingleRhythmPatternId = pattern.id;
patterns = [pattern];
} else {
patterns = Array.from({length: count}, () => randomItem(patternPool));
}
return { type: "rhythm", patterns, values: patterns.flatMap(pattern => pattern.label.split(" ")), notes: [], label: patterns.map(pattern => pattern.label).join(" · ") };
}

const konokolPatterns = [
{ id: "tha-ka-de-mi", label: "Tha ka De Mi", slots: [1, 1, 1, 1], beams: [[0, 3, 1], [0, 3, 2]] },
{ id: "tha-ka-de", label: "Tha Ka De", slots: [1, 1, 2], beams: [[0, 2, 1], [0, 1, 2]] },
{ id: "tha-de-mi", label: "Tha De Mi", slots: [2, 1, 1], beams: [[0, 3, 1], [2, 3, 2]] },
{ id: "tha-ka-mi", label: "Tha Ka Mi", slots: [1, 2, 1], beams: [[0, 3, 1]], flags: [[0, 1, "right", 2], [3, 1, "left", 2]] },
{ id: "ka-de-mi", label: "Ka De Mi", slots: [0, 1, 1, 1], beams: [[1, 3, 1], [1, 3, 2]] },
{ id: "tha-mi", label: "Tha Mi", slots: [3, 1], beams: [[0, 3, 1]], flags: [[3, 1, "left", 2]], dots: [0] },
{ id: "tha-ka", label: "Tha Ka", slots: [1, 3], beams: [[0, 1, 1]], flags: [[0, 1, "right", 2]], dots: [1] },
{ id: "tha-de", label: "Tha De", slots: [2, 2], beams: [[0, 2, 1]] },
{ id: "de-mi", label: "De Mi", slots: [0, 0, 1, 1], beams: [[2, 3, 1], [2, 3, 2]] },
{ id: "ka-de", label: "Ka De", slots: [0, 1, 1, 0], beams: [[1, 2, 1], [1, 2, 2]] },
{ id: "ka-mi", label: "Ka Mi", slots: [0, 1, 0, 1], flags: [[1, 2, "right", 1], [3, 2, "right", 1]] },
{ id: "tha", label: "Tha", slots: [4] },
{ id: "ka", label: "Ka", slots: [0, 1, 0, 0], flags: [[1, 2, "right", 1]] },
{ id: "de", label: "De", slots: [0, 0, 1, 0], flags: [[2, 2, "right", 1]] },
{ id: "mi", label: "Mi", slots: [0, 0, 0, 1], flags: [[3, 2, "right", 1]] }
];

function renderKonokolPattern(pattern){
const positions = []; let cursor = 0;
const syllables = pattern.label.split(" ");
pattern.slots.forEach(duration => { if(duration) positions.push({ x: 14 + cursor * 21, duration, start: cursor }); cursor += duration || 1; });
const hasHorizontalBar = start => (pattern.beams || []).some(([from, to]) => start >= from && start <= to)
    || (pattern.flags || []).some(([flagStart]) => flagStart === start);
const notes = positions.map(({x, start}) => `<ellipse cx="${x}" cy="26" rx="4.5" ry="3.2" transform="rotate(-20 ${x} 26)" fill="currentColor"/><path d="M${x + 4} 26V${hasHorizontalBar(start) ? 12.5 : 9}" stroke="currentColor" stroke-width="2"/>`).join("");
const xAt = start => 18 + start * 21;
const beamY = level => level === 1 ? 9.5 : 14.5;
const beams = (pattern.beams || []).map(([from, to, level]) => `<rect x="${xAt(from) - .4}" y="${beamY(level)}" width="${xAt(to) - xAt(from) + .8}" height="3" fill="currentColor"/>`).join("");
const flags = (pattern.flags || []).map(([start, count, direction = "right", startLevel = 1]) => Array.from({length: count}, (_, index) => {
const x = xAt(start), y = beamY(startLevel + index);
return direction === "left"
? `<path d="M${x - 8} ${y}H${x}v3H${x - 8}z" fill="currentColor"/>`
: `<path d="M${x} ${y}H${x + 8}v3H${x}z" fill="currentColor"/>`;
}).join("")).join("");
const dots = (pattern.dots || []).map(start => `<circle cx="${xAt(start) + 8}" cy="26" r="1.8" fill="currentColor"/>`).join("");
const rests = pattern.slots.map((duration, index) => duration ? "" : `<path d="M${14 + index * 21 - 3} 18l5 3-4 4" fill="none" stroke="currentColor" stroke-width="1.6"/>`).join("");
const labels = positions.map(({x}, index) => `<text x="${x}" y="43" text-anchor="middle" fill="currentColor">${syllables[index] || ""}</text>`).join("");
return `<svg class="konokol-notation" viewBox="0 0 98 48" aria-hidden="true">${rests}${notes}${beams}${flags}${dots}${labels}</svg>`;
}

function getAvailableKonokolPatterns(){
const selected = new Set([...document.querySelectorAll(".hearRhythmPatternOption:checked")].map(input => input.value));
return selected.size ? konokolPatterns.filter(pattern => selected.has(pattern.id)) : konokolPatterns;
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
if(typeof initAudio === "function"){
initAudio();
return audioContext;
}
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

function playExercise(exercise, syncWithPulse = false, startTime){
const context = getAudioContext();
const start = startTime ?? context.currentTime + (syncWithPulse ? 0 : 0.03);
const beatDuration = 60 / bpm;
if(exercise.type === "rhythm"){
const sixteenth = beatDuration / 4;
exercise.patterns.forEach((pattern, patternIndex) => {
let rhythmCursor = 0;
pattern.slots.forEach(duration => { if(duration) playWoodblock(context, start + patternIndex * beatDuration + rhythmCursor * sixteenth); rhythmCursor += duration || 1; });
});
return exercise.patterns.length * beatDuration;
}
if(exercise.type === "chord" && getExerciseType() === "chord"){
const chordDuration = beatDuration * 1.9;
exercise.notes.forEach(note => playTone(note, start, chordDuration));
return Math.max(chordDuration, document.getElementById("instrumentSelect").value === "piano" ? 3.2 : chordDuration);
}

function playWoodblock(context, start){
const output = context.createGain();
output.gain.setValueAtTime(.0001, start);
output.gain.exponentialRampToValueAtTime(.16, start + .002);
output.gain.exponentialRampToValueAtTime(.0001, start + .16);
output.connect(context.destination);

[[620, 1], [930, .42], [1450, .14]].forEach(([frequency, level]) => {
const oscillator = context.createOscillator();
const gain = context.createGain();
oscillator.type = "sine";
oscillator.frequency.setValueAtTime(frequency, start);
oscillator.frequency.exponentialRampToValueAtTime(frequency * .92, start + .12);
gain.gain.value = level;
oscillator.connect(gain); gain.connect(output);
oscillator.start(start); oscillator.stop(start + .18);
});

const noise = context.createBufferSource();
const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * .012), context.sampleRate);
const noiseData = noiseBuffer.getChannelData(0);
for(let index = 0; index < noiseData.length; index++) noiseData[index] = (Math.random() * 2 - 1) * .25;
const noiseFilter = context.createBiquadFilter();
const noiseGain = context.createGain();
noiseFilter.type = "bandpass"; noiseFilter.frequency.value = 2100; noiseFilter.Q.value = .8;
noiseGain.gain.setValueAtTime(.045, start); noiseGain.gain.exponentialRampToValueAtTime(.0001, start + .012);
noise.buffer = noiseBuffer; noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(output);
noise.start(start); noise.stop(start + .014);
}
const noteDuration = beatDuration * 0.82;
exercise.notes.forEach((note, index) => playTone(note, start + index * beatDuration, noteDuration));
const resonance = document.getElementById("instrumentSelect").value === "piano" ? 3.2 : noteDuration;
return Math.max(noteDuration, (exercise.notes.length - 1) * beatDuration + resonance);
}

function isLongHearExercise(){
return ["scale", "arpeggio", "rhythm"].includes(getExerciseType());
}

let longExerciseTimer = null;

function clearLongExerciseTimer(){
window.clearTimeout(longExerciseTimer);
longExerciseTimer = null;
}

function scheduleLongExercise(duration){
if(!metronomeRunning || !isLongHearExercise()) return;

if(getExerciseType() === "rhythm"){
rhythmMeasureCount = 0;
rhythmBeatsPlayed = 0;
rhythmPlaybackActive = false;
return;
}

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

function generateAndPlay(playImmediately = true){
clearLongExerciseTimer();
hideHearAnswer();
const type = getExerciseType();
let candidate;
for(let attempt = 0; attempt < 12; attempt++){
candidate = type === "note" ? { type: "note", notes: [createNoteHeight()] } : type === "interval" ? createIntervalExercise() : type === "scale" ? createScaleExercise() : type === "rhythm" ? createRhythmExercise() : createChordExercise();
if(type === "arpeggio" && (getHearDirection() === "descending" || (getHearDirection() === "mixed" && Math.random() < .5))) candidate.notes.reverse();
const identity = exerciseIdentity(candidate);
if(!(previousExerciseIdentities.length >= 2 && previousExerciseIdentities.slice(-2).every(item => item === identity))) break;
}
currentExercise = candidate;
if(type === "rhythm") { selectedKonokolPatterns = []; hearRhythmIncorrectIndexes.clear(); renderHearRhythmSelection(); }
previousExerciseIdentities.push(exerciseIdentity(currentExercise));
previousExerciseIdentities = previousExerciseIdentities.slice(-2);
if(playImmediately){
const duration = type === "rhythm" ? 0 : playExercise(currentExercise);
scheduleLongExercise(duration);
}
}

function getHearExerciseBeatCount(exercise){
if(exercise.type === "rhythm") return exercise.patterns.length;
if(exercise.type === "chord") return 2;
return Math.max(1, exercise.notes.length);
}

function replayExerciseWithMetronome(exercise){
const context = getAudioContext();
// Un léger délai laisse au navigateur le temps de programmer ensemble le clic
// et les notes : chaque réécoute repart exactement sur le premier temps.
const start = context.currentTime + 0.08;
const beatDuration = 60 / bpm;
// Un dernier clic sur la pulsation suivante rend la fin du motif audible.
const beats = getHearExerciseBeatCount(exercise) + 1;

if(!metronomeRunning){
for(let index = 0; index < beats; index++){
clickSound(index === 0, start + index * beatDuration);
}
}

return playExercise(exercise, false, start);
}

function replayCurrentExercise(){
if(!currentExercise) generateAndPlay(false);
if(currentExercise){
clearLongExerciseTimer();
hideHearAnswer();
hearAwaitingNext = false;
answerMeasuresRemaining = 0;
const duration = replayExerciseWithMetronome(currentExercise);
scheduleLongExercise(duration);
}
}

let currentMeasure = 0;
let measureLimit = Number(document.getElementById("measureChange").value);
let skipFirstMeasure = false;
let answerMeasuresRemaining = 0;
let rhythmMeasureCount = 0;
let rhythmBeatsPlayed = 0;
let rhythmPlaybackActive = false;
function setMeasureLimit(value){ measureLimit = Number(value); currentMeasure = 0; answerMeasuresRemaining = 0; }
function nextMeasure(){
if(isLongHearExercise()){
if(getExerciseType() === "rhythm"){
rhythmMeasureCount++;
if(rhythmMeasureCount === 2 && currentExercise){
playExercise(currentExercise, true);
rhythmPlaybackActive = true;
rhythmBeatsPlayed = 0;
hearAwaitingNext = true;
}
}
return;
}
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
function onMetronomeBeat(){
if(!rhythmPlaybackActive || !currentExercise?.patterns) return;
rhythmBeatsPlayed++;
if(rhythmBeatsPlayed === currentExercise.patterns.length) revealHearAnswer();
if(rhythmBeatsPlayed === currentExercise.patterns.length + 1){
rhythmPlaybackActive = false;
hearAwaitingNext = false;
stopMetronome();
}
}
function onMetronomeStart(){ skipFirstMeasure = true; hearAwaitingNext = false; answerMeasuresRemaining = 0; generateAndPlay(); }
function onMetronomeStop(){ clearLongExerciseTimer(); window.clearTimeout(hearAnswerTimer); hearAwaitingNext = false; answerMeasuresRemaining = 0; rhythmPlaybackActive = false; rhythmBeatsPlayed = 0; rhythmMeasureCount = 0; }

document.getElementById("replayNote").addEventListener("click", replayCurrentExercise);
document.getElementById("measureChange").addEventListener("change", event => setMeasureLimit(event.target.value));
document.getElementById("hearExerciseType").addEventListener("change", ()=>{
updateHearControls();
renderHearRhythmSelection();
});
document.querySelectorAll('input[name="noteGenerationMode"], input[name="hearHarmonyMode"]').forEach(input => input.addEventListener("change", updateHearControls));
document.querySelectorAll("#noteRootSelect, #noteModeSelect, #minOctave, #maxOctave, #instrumentSelect, #noteNameFormat, #showHearDegree, #hearRhythmPatternCount, .hearQualityOption, .hearIntervalOption, input[name=\"hearDirection\"]").forEach(control => control.addEventListener("change", ()=>{
currentExercise = null;
previousExerciseIdentities = [];
clearLongExerciseTimer();
hideHearAnswer();
if(getExerciseType() === "rhythm") renderHearRhythmSelection();
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

const hearRhythmPatternOptions = document.getElementById("hearRhythmPatternOptions");
konokolPatterns.forEach(pattern => {
const label = document.createElement("label");
label.innerHTML = `<input class="hearRhythmPatternOption" type="checkbox" value="${pattern.id}" checked> ${pattern.label}`;
const input = label.querySelector("input");
input.addEventListener("change", ()=>{
if(!document.querySelectorAll(".hearRhythmPatternOption:checked").length){
document.querySelectorAll(".hearRhythmPatternOption").forEach(option => option.checked = true);
}
previousSingleRhythmPatternId = null;
currentExercise = null;
previousExerciseIdentities = [];
hideHearAnswer();
renderHearRhythmOptions();
renderHearRhythmSelection();
});
hearRhythmPatternOptions.appendChild(label);
});

updateHearControls();

const hearRhythmPatterns = document.getElementById("hearRhythmPatterns");
const hearRhythmSelection = document.getElementById("hearRhythmSelection");
const hearRhythmSelectedPatterns = document.getElementById("hearRhythmSelectedPatterns");
const hearRhythmStatus = document.getElementById("hearRhythmStatus");

function renderHearRhythmSelection(){
const isRhythm = getExerciseType() === "rhythm";
if(hearRhythmSelection) hearRhythmSelection.hidden = !isRhythm;
if(!hearRhythmSelectedPatterns) return;
const slotCount = currentExercise?.type === "rhythm"
? currentExercise.patterns.length
: Number(document.getElementById("hearRhythmPatternCount").value);
selectedKonokolPatterns.length = slotCount;
hearRhythmSelectedPatterns.dataset.slotCount = String(slotCount);
hearRhythmSelectedPatterns.replaceChildren(...Array.from({length: slotCount}, (_, index) => {
const id = selectedKonokolPatterns[index];
const pattern = konokolPatterns.find(item => item.id === id);
if(!pattern){
const slot = document.createElement("div");
slot.className = "hear-rhythm-selected-pattern hear-rhythm-selected-pattern--empty";
slot.dataset.index = String(index);
slot.setAttribute("aria-label", `Emplacement ${index + 1} vide`);
addHearRhythmDropTarget(slot, index);
return slot;
}
const item = document.createElement("button");
item.type = "button";
item.className = "hear-rhythm-selected-pattern";
if(hearRhythmIncorrectIndexes.has(index)) item.classList.add("is-incorrect");
item.draggable = true;
item.dataset.pattern = id;
item.dataset.index = String(index);
item.setAttribute("aria-label", `Pattern sélectionné : ${pattern?.label || id}`);
item.innerHTML = pattern ? renderKonokolPattern(pattern) : "";
item.addEventListener("dragstart", event => {
event.dataTransfer.effectAllowed = "move";
hearRhythmDragPayload = { source: "selected", index };
event.dataTransfer.setData("text/plain", JSON.stringify(hearRhythmDragPayload));
item.classList.add("is-dragging");
});
item.addEventListener("dragend", () => { item.classList.remove("is-dragging"); hearRhythmDragPayload = null; });
addHearRhythmDropTarget(item, index);
return item;
}));
}

function addHearRhythmDropTarget(target, index){
target.addEventListener("dragenter", event => { event.preventDefault(); target.classList.add("is-drop-target"); });
target.addEventListener("dragover", event => { event.preventDefault(); event.dataTransfer.dropEffect = hearRhythmDragPayload?.source === "option" ? "copy" : "move"; target.classList.add("is-drop-target"); });
target.addEventListener("dragleave", () => target.classList.remove("is-drop-target"));
target.addEventListener("drop", event => {
event.preventDefault();
target.classList.remove("is-drop-target");
try {
const data = hearRhythmDragPayload || JSON.parse(event.dataTransfer.getData("text/plain"));
if(data.source === "option") selectedKonokolPatterns[index] = data.pattern;
if(data.source === "selected" && data.index !== index){
const moved = selectedKonokolPatterns[data.index];
const replaced = selectedKonokolPatterns[index];
selectedKonokolPatterns[index] = moved;
selectedKonokolPatterns[data.index] = replaced;
}
hearRhythmIncorrectIndexes.clear();
hearRhythmStatus.textContent = "";
hearRhythmStatus.dataset.state = "";
renderHearRhythmSelection();
} catch(_) {}
});
}

function validateHearRhythmAnswer(){
if(hearRhythmAdvancing || currentExercise?.type !== "rhythm" || !selectedKonokolPatterns.length) return;
const expected = currentExercise.patterns.map(item => item.id);
const selectedCount = selectedKonokolPatterns.filter(Boolean).length;
if(selectedCount !== expected.length){
hearRhythmStatus.textContent = `Choisis encore ${expected.length - selectedCount} pattern${expected.length - selectedCount > 1 ? "s" : ""}.`;
hearRhythmStatus.dataset.state = "trying";
return;
}
const correct = selectedKonokolPatterns.join("|") === expected.join("|");
hearRhythmStatus.textContent = correct ? "✓ Patterns corrects" : "Réessaie";
hearRhythmStatus.dataset.state = correct ? "correct" : "trying";
if(!correct){
hearRhythmIncorrectIndexes = new Set(selectedKonokolPatterns.flatMap((patternId, index) => patternId === expected[index] ? [] : [index]));
renderHearRhythmSelection();
return;
}

hearRhythmAdvancing = true;
hearNextRhythmTimer = window.setTimeout(()=>{
hearRhythmAdvancing = false;
selectedKonokolPatterns = [];
hearRhythmIncorrectIndexes.clear();
hearRhythmStatus.textContent = "";
hearRhythmStatus.dataset.state = "";
renderHearRhythmSelection();

if(getExerciseType() !== "rhythm") return;
if(metronomeRunning) generateAndPlay();
else startMetronome();
}, 1000);
}

function renderHearRhythmOptions(){
if(!hearRhythmPatterns) return;
hearRhythmPatterns.replaceChildren(...getAvailableKonokolPatterns().map(pattern => {
const button = document.createElement("button"); button.type = "button"; button.className = "hear-rhythm-pattern"; button.dataset.pattern = pattern.id; button.setAttribute("aria-label", pattern.label); button.draggable = true; button.innerHTML = renderKonokolPattern(pattern);
button.addEventListener("dragstart", event => {
event.dataTransfer.effectAllowed = "copy";
hearRhythmDragPayload = { source: "option", pattern: pattern.id };
event.dataTransfer.setData("text/plain", JSON.stringify(hearRhythmDragPayload));
button.classList.add("is-dragging");
});
button.addEventListener("dragend", () => { button.classList.remove("is-dragging"); hearRhythmDragPayload = null; });
button.addEventListener("click", () => {
if(currentExercise?.type !== "rhythm") return;
const expectedCount = currentExercise.patterns.length;
if(expectedCount === 1) selectedKonokolPatterns = [pattern.id];
else if(selectedKonokolPatterns.filter(Boolean).length < expectedCount) selectedKonokolPatterns[selectedKonokolPatterns.findIndex(item => !item)] = pattern.id;
else return;
hearRhythmIncorrectIndexes.clear();
hearRhythmStatus.textContent = "";
hearRhythmStatus.dataset.state = "";
renderHearRhythmSelection();
}); return button;
}));
}

renderHearRhythmOptions();
document.getElementById("hearRhythmValidate")?.addEventListener("click", validateHearRhythmAnswer);
document.getElementById("hearRhythmClear")?.addEventListener("click", () => { selectedKonokolPatterns = []; hearRhythmIncorrectIndexes.clear(); hearRhythmStatus.textContent = ""; hearRhythmStatus.dataset.state = ""; renderHearRhythmSelection(); });
document.addEventListener("keydown", event => {
if(event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey && !event.altKey){
const target = event.target;
if(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) return;
event.preventDefault();
replayCurrentExercise();
return;
}
if(event.key !== "Enter" || getExerciseType() !== "rhythm") return;
const target = event.target;
if(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) return;
if(!selectedKonokolPatterns.length) return;
event.preventDefault();
validateHearRhythmAnswer();
});
