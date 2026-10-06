let hearVocalContext, hearVocalAnalyser, hearVocalStream, hearVocalFrame, hearVocalActive = false;
function hearAutoCorrelate(buffer, rate){
let energy = 0; for(const sample of buffer) energy += sample * sample;
if(Math.sqrt(energy / buffer.length) < .012) return -1;
const min = Math.floor(rate / 1100), max = Math.min(Math.floor(rate / 70), Math.floor(buffer.length / 2)); let best = 0, bestOffset = -1;
for(let offset = min; offset <= max; offset++){ let difference = 0; for(let index = 0; index < max; index++) difference += Math.abs(buffer[index] - buffer[index + offset]); const correlation = 1 - difference / max; if(correlation > best){ best = correlation; bestOffset = offset; } }
return best > .78 ? rate / bestOffset : -1;
}
function updateHearVocal(){
if(!hearVocalActive) return;
const data = new Float32Array(hearVocalAnalyser.fftSize); hearVocalAnalyser.getFloatTimeDomainData(data); const frequency = hearAutoCorrelate(data, hearVocalContext.sampleRate);
if(frequency > 0 && currentExercise?.notes?.[0]){ const midi = Math.round(69 + 12 * Math.log2(frequency / 440)); const detected = ((midi % 12) + 12) % 12, target = currentExercise.notes[0].midi % 12; const status = document.getElementById("hearVocalStatus"); status.textContent = `${sharpNotes[detected]} ${detected === target ? "✓" : ""}`; status.dataset.state = detected === target ? "correct" : "trying"; }
hearVocalFrame = requestAnimationFrame(updateHearVocal);
}
async function toggleHearVocal(){
const button = document.getElementById("hearVocalButton");
if(hearVocalActive){ hearVocalActive = false; cancelAnimationFrame(hearVocalFrame); hearVocalStream?.getTracks().forEach(track => track.stop()); hearVocalContext?.close(); button.textContent = "🎙 Chanter la note"; return; }
try { hearVocalStream = await navigator.mediaDevices.getUserMedia({audio:{autoGainControl:false, echoCancellation:false, noiseSuppression:false}}); hearVocalContext = new AudioContext(); hearVocalAnalyser = hearVocalContext.createAnalyser(); hearVocalAnalyser.fftSize = 2048; hearVocalContext.createMediaStreamSource(hearVocalStream).connect(hearVocalAnalyser); hearVocalActive = true; button.textContent = "🎙 Micro actif"; updateHearVocal(); } catch(_) { document.getElementById("hearVocalStatus").textContent = "Micro indisponible"; }
}
document.getElementById("hearVocalButton")?.addEventListener("click", toggleHearVocal);
