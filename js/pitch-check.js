// NeckLab - Microphone pitch verification

let pitchAudioContext = null;
let pitchAnalyser = null;
let pitchMicrophoneStream = null;
let pitchAnimationFrame = null;
let pitchChecking = false;

const PITCH_TOLERANCE_CENTS = 40;
const pitchNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const intervalSemitones = {
"1": 0, "♭2": 1, "2": 2, "♭3": 3, "3": 4, "4": 5, "♯4": 6,
"♭5": 6, "5": 7, "♯5": 8, "♭6": 8, "6": 9, "♭7": 10, "7": 11,
"♭9": 1, "9": 2, "♯9": 3, "11": 5, "♯11": 6, "♭13": 8, "13": 9,
"2M": 2, "3m": 3, "3M": 4, "4J": 5, "5J": 7, "6M": 9,
"7M": 11, "9M": 2, "11J": 5, "13M": 9, "Fondamentale": 0
};

function getPitchCheckTarget(){
const root = previous?.note || document.getElementById("note")?.textContent.trim();
const rootPitchClass = getPitchClass(root);
if(rootPitchClass < 0) return -1;

const intervalEnabled = document.getElementById("showInterval")?.checked;
const intervalLabel = previous?.interval?.label;
if(!intervalEnabled || !intervalLabel) return rootPitchClass;

return (rootPitchClass + (intervalSemitones[intervalLabel] ?? 0)) % 12;
}

function autoCorrelatePitch(buffer, sampleRate){
let rms = 0;
for(let index = 0; index < buffer.length; index++) rms += buffer[index] * buffer[index];
if(Math.sqrt(rms / buffer.length) < 0.012) return -1;

const minimumOffset = Math.floor(sampleRate / 1100);
const maximumOffset = Math.min(Math.floor(sampleRate / 70), Math.floor(buffer.length / 2));
let bestOffset = -1;
let bestCorrelation = 0;

for(let offset = minimumOffset; offset <= maximumOffset; offset++){
let difference = 0;
for(let index = 0; index < maximumOffset; index++) difference += Math.abs(buffer[index] - buffer[index + offset]);
const correlation = 1 - difference / maximumOffset;
if(correlation > bestCorrelation){
bestCorrelation = correlation;
bestOffset = offset;
}
}

return bestCorrelation > 0.78 ? sampleRate / bestOffset : -1;
}

function setPitchStatus(message, state = "idle"){
const status = document.getElementById("pitchCheckStatus");
if(!status) return;
status.textContent = message;
status.dataset.state = state;
const exerciseCard = document.querySelector(".exercise-card");
exerciseCard?.classList.toggle("is-pitch-correct", state === "correct");
exerciseCard?.classList.toggle("is-pitch-incorrect", state === "trying");
}

function updatePitchCheck(){
if(!pitchChecking || !pitchAnalyser) return;

const samples = new Float32Array(pitchAnalyser.fftSize);
pitchAnalyser.getFloatTimeDomainData(samples);
const frequency = autoCorrelatePitch(samples, pitchAudioContext.sampleRate);

if(frequency > 0){
const midi = 69 + 12 * Math.log2(frequency / 440);
const nearestMidi = Math.round(midi);
const cents = Math.round((midi - nearestMidi) * 100);
const detectedPitchClass = ((nearestMidi % 12) + 12) % 12;
const targetPitchClass = getPitchCheckTarget();

if(targetPitchClass === detectedPitchClass && Math.abs(cents) <= PITCH_TOLERANCE_CENTS){
setPitchStatus("✓", "correct");
} else {
setPitchStatus("✕", "trying");
}
}

pitchAnimationFrame = window.requestAnimationFrame(updatePitchCheck);
}

async function startPitchChecking(){
if(!navigator.mediaDevices?.getUserMedia){
setPitchStatus("Le navigateur ne permet pas l'accès au micro.", "error");
return;
}

try {
pitchMicrophoneStream = await navigator.mediaDevices.getUserMedia({
audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false }
});
pitchAudioContext = new AudioContext();
pitchAnalyser = pitchAudioContext.createAnalyser();
pitchAnalyser.fftSize = 2048;
pitchAudioContext.createMediaStreamSource(pitchMicrophoneStream).connect(pitchAnalyser);
pitchChecking = true;
document.getElementById("pitchCheckButton").textContent = "🎙 Micro actif";
setPitchStatus("", "idle");
updatePitchCheck();
} catch(error) {
setPitchStatus("Autorisation du micro refusée ou indisponible.", "error");
}
}

function stopPitchChecking(){
pitchChecking = false;
window.cancelAnimationFrame(pitchAnimationFrame);
pitchMicrophoneStream?.getTracks().forEach(track => track.stop());
pitchMicrophoneStream = null;
pitchAnalyser = null;
pitchAudioContext?.close();
pitchAudioContext = null;
const button = document.getElementById("pitchCheckButton");
if(button) button.textContent = "🎙 Activer le micro";
setPitchStatus("", "idle");
}

document.getElementById("pitchCheckButton")?.addEventListener("click", ()=>{
if(pitchChecking) stopPitchChecking();
else startPitchChecking();
});
