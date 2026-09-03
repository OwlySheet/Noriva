// NeckLab - Hear session timer

let hearSessionElapsedSeconds = 0;
let hearSessionTimerId = null;

function updateHearSessionTimer(){
const timer = document.getElementById("sessionTimer");
if(!timer) return;

const minutes = Math.floor(hearSessionElapsedSeconds / 60);
const seconds = hearSessionElapsedSeconds % 60;
timer.textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
timer.dateTime = "PT" + hearSessionElapsedSeconds + "S";
}

function startSessionTimer(){
if(hearSessionTimerId) return;

hearSessionTimerId = window.setInterval(()=>{
hearSessionElapsedSeconds++;
updateHearSessionTimer();
}, 1000);
}

function pauseSessionTimer(){
window.clearInterval(hearSessionTimerId);
hearSessionTimerId = null;
}
