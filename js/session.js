// NeckLab - Practice Session

let currentMeasure = 0;
let measureLimit = 4;
let sessionElapsedSeconds = 0;
let sessionTimerId = null;
let positionAnswerTimer = null;
let positionRevealTimer = null;
let visualAwaitingNext = false;

function formatSessionDuration(seconds){
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;
return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

function updateSessionTimer(){
const sessionTimer = document.getElementById("sessionTimer");
if(sessionTimer){
sessionTimer.textContent = formatSessionDuration(sessionElapsedSeconds);
sessionTimer.dateTime = "PT" + sessionElapsedSeconds + "S";
}
}

function startSessionTimer(){
if(sessionTimerId) return;
sessionTimerId = window.setInterval(()=>{
sessionElapsedSeconds++;
updateSessionTimer();
}, 1000);
}

function pauseSessionTimer(){
window.clearInterval(sessionTimerId);
sessionTimerId = null;
}

function setMeasureLimit(value){
measureLimit = Number(value);
currentMeasure = 0;
}

function nextMeasure(){
if(visualAwaitingNext) return;

currentMeasure += 1;
if(currentMeasure < measureLimit) return;

visualAwaitingNext = true;
const beatDuration = (60 / bpm) * 1000;
// Une mesure : le dernier temps. Deux ou quatre : l'avant-dernier temps de la dernière mesure.
const revealDelay = beatDuration * (measureLimit === 1 ? 3 : 2);
positionRevealTimer = window.setTimeout(revealPositionAnswer, revealDelay);
positionAnswerTimer = window.setTimeout(()=>{
visualAwaitingNext = false;
currentMeasure = 0;
generate();
}, beatDuration * 4);
}

function onMetronomeStart(){
currentMeasure = 0;
visualAwaitingNext = false;
window.clearTimeout(positionRevealTimer);
window.clearTimeout(positionAnswerTimer);
hidePositionAnswer();
}

function onMetronomeStop(){
window.clearTimeout(positionRevealTimer);
window.clearTimeout(positionAnswerTimer);
visualAwaitingNext = false;
}

function resetSession(){
currentMeasure = 0;
visualAwaitingNext = false;
window.clearTimeout(positionRevealTimer);
window.clearTimeout(positionAnswerTimer);
hidePositionAnswer();
sessionElapsedSeconds = 0;
updateSessionTimer();
}
