// NeckLab - Metronome Engine


let audioContext;

let metronomeRunning = false;

let bpm = 80;

let metronomeVolume = 0.7;

let metronomeOutput;

let beat = 0;

let interval;



function initAudio(){

if(!audioContext){

audioContext = new AudioContext();

metronomeOutput = audioContext.createGain();
metronomeOutput.gain.value = metronomeVolume;
metronomeOutput.connect(audioContext.destination);

}

if(audioContext.state === "suspended"){

audioContext.resume();

}

}

function setMetronomeVolume(value){

metronomeVolume = Math.max(0, Math.min(1, Number(value)));

if(metronomeOutput){
metronomeOutput.gain.setTargetAtTime(metronomeVolume, audioContext.currentTime, 0.01);
}

window.dispatchEvent(new CustomEvent("metronomevolumechange", { detail: metronomeVolume }));

}

function getMetronomeVolume(){
return metronomeVolume;
}



function clickSound(strong=false){


initAudio();


const now = audioContext.currentTime;


// Oscillateur principal (corps du bois)
const oscillator =
audioContext.createOscillator();


const gain =
audioContext.createGain();


oscillator.type = "triangle";


// Temps fort plus aigu
oscillator.frequency.value =
strong ? 1400 : 950;


// Attaque très courte + chute rapide
gain.gain.setValueAtTime(
0.001,
now
);

gain.gain.exponentialRampToValueAtTime(
strong ? 0.35 : 0.25,
now + 0.005
);

gain.gain.exponentialRampToValueAtTime(
0.001,
now + 0.08
);


// Connexions
oscillator.connect(gain);

gain.connect(metronomeOutput);


oscillator.start(now);

oscillator.stop(
now + 0.09
);


// Petite couche de bruit pour le côté "bois"
const buffer =
audioContext.createBuffer(
1,
audioContext.sampleRate * 0.02,
audioContext.sampleRate
);


const data =
buffer.getChannelData(0);


for(let i=0;i<data.length;i++){

data[i] =
(Math.random()*2-1) * 0.2;

}


const noise =
audioContext.createBufferSource();


const noiseGain =
audioContext.createGain();


noise.buffer = buffer;


noiseGain.gain.setValueAtTime(
0.15,
now
);

noiseGain.gain.exponentialRampToValueAtTime(
0.001,
now + 0.02
);


noise.connect(noiseGain);

noiseGain.connect(metronomeOutput);


noise.start(now);


}

function updateMetroButtons(){

const metroButton =
document.getElementById("metroButton");



if(metroButton){

metroButton.textContent =
metronomeRunning
?
"⏸ Arrêter"
:
"▶ Démarrer";

}
}

function startMetronome(){


if(metronomeRunning)
return;


metronomeRunning=true;

updateMetroButtons();

if(typeof startSessionTimer === "function"){
startSessionTimer();
}

if(typeof onMetronomeStart === "function"){

onMetronomeStart();

}


beat=0;


function tick(){


if(!metronomeRunning)
return;


if(beat===0){

nextMeasure();

}


// Hear utilise le tempo comme horloge d'exercice, jamais comme clic audible.
if(!document.body.classList.contains("hear-page")){

clickSound(beat===0);

}


beat++;


if(beat>=4){

beat=0;

}


// utilise toujours le BPM actuel
interval =
setTimeout(
tick,
60000 / bpm
);


}


tick();


}



function stopMetronome(){


metronomeRunning=false;


clearTimeout(interval);


updateMetroButtons();

if(typeof pauseSessionTimer === "function"){
pauseSessionTimer();
}

if(typeof onMetronomeStop === "function"){
onMetronomeStop();
}


}


function setBpm(value){

bpm=Math.max(40, Math.min(200, Number(value) || 80));

}

function renderBpmValue(value){
const bpmValue = document.getElementById("bpmValue");
if(!bpmValue) return;
if(bpmValue instanceof HTMLInputElement){
bpmValue.value = value;
return;
}
const unit = document.createElement("small");
unit.textContent = "BPM";
bpmValue.replaceChildren(document.createTextNode(value + " "), unit);
}

function syncBpmControl(value){

const bpmSlider = document.getElementById("bpm");
const bpmValue = document.getElementById("bpmValue");

if(!bpmSlider || !bpmValue) return;

setBpm(value);
bpmSlider.value = bpm;
renderBpmValue(bpm);

}

document.getElementById("bpm")?.addEventListener("input", (event)=>{

syncBpmControl(event.currentTarget.value);

if(typeof saveSettings === "function") saveSettings();

});

document.getElementById("bpmValue")?.addEventListener("change", (event)=>{
const value = Number(event.currentTarget.value);
if(!Number.isFinite(value)) return renderBpmValue(bpm);
syncBpmControl(value);
if(typeof saveSettings === "function") saveSettings();
});

document.getElementById("bpmValue")?.addEventListener("keydown", (event)=>{
if(event.key !== "Enter") return;
event.currentTarget.blur();
});

function changeBpmBy(amount){

const bpmSlider = document.getElementById("bpm");
const bpmValue = document.getElementById("bpmValue");

if(!bpmSlider || !bpmValue) return;

const nextBpm = Math.max(
Number(bpmSlider.min),
Math.min(Number(bpmSlider.max), Number(bpmSlider.value) + amount)
);

bpmSlider.value = nextBpm;
renderBpmValue(nextBpm);
setBpm(nextBpm);

if(typeof saveSettings === "function"){

saveSettings();

}

}

document.addEventListener(
"keydown",
(e)=>{

if(["volumeControl", "metronomeVolume"].includes(document.activeElement?.id)) return;

if(e.code === "Space"){

e.preventDefault();
e.stopPropagation();

if(e.repeat) return;

if(metronomeRunning){

stopMetronome();

}
else{

startMetronome();

}

return;

}


const keyboardChanges = {
ArrowLeft: -1,
ArrowRight: 1,
ArrowDown: -5,
ArrowUp: 5
};


if(Object.hasOwn(keyboardChanges, e.code)){

e.preventDefault();
changeBpmBy(keyboardChanges[e.code]);

}


},
true
);
