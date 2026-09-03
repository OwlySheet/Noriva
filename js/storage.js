// NeckLab - Storage System
const IS_STUDENT =
new URLSearchParams(window.location.search).has("student");


const STORAGE_KEY =
"necklab_teacher_settings";

function selectedIntervalValues(){

return [...document.querySelectorAll(".intervalOption:checked")]
.map(option => option.value);

}

function getStudentLinkConfig(){

const encodedConfig = new URLSearchParams(window.location.search)
.get("config");

if(!IS_STUDENT || !encodedConfig){
return null;
}

try {

const base64 = encodedConfig.replace(/-/g, "+").replace(/_/g, "/");
const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));

return JSON.parse(new TextDecoder().decode(bytes));

} catch(error) {

console.warn("Lien élève invalide.", error);
return null;

}

}

function getShareableSettings(){

return {
bpm: document.getElementById("bpm")?.value ?? 80,
metronomeVolume: document.getElementById("metronomeVolume")?.value ?? 70,
antiRepeat: document.getElementById("antiRepeat")?.checked ?? true,
generationMode: document.querySelector('input[name="generationMode"]:checked')?.value ?? "chromatic",
root: document.getElementById("rootSelect")?.value ?? "C",
mode: document.getElementById("modeSelect")?.value ?? "Majeur/Ionien",
notes: checkedValues("note"),
qualities: checkedValues("quality"),
strings: checkedValues("string"),
zones: checkedValues("zone"),
intervals: selectedIntervalValues(),
intervalGenerationMode: document.querySelector('input[name="intervalGenerationMode"]:checked')?.value ?? "chromatic",
measureChange: document.getElementById("measureChange")?.value ?? "4",
showTone: document.getElementById("showTone")?.checked ?? true,
showQuality: document.getElementById("showQuality")?.checked ?? true,
showNext: document.getElementById("showNext")?.checked ?? true,
showDegree: document.getElementById("showDegree")?.checked ?? true,
showString: document.getElementById("showString")?.checked ?? false,
showZone: document.getElementById("showZone")?.checked ?? false,
showInterval: document.getElementById("showInterval")?.checked ?? false,
showPositionAnswer: document.getElementById("showPositionAnswer")?.checked ?? true,
showPitchCheck: document.getElementById("showPitchCheck")?.checked ?? true
};

}

function createStudentLink(){

const data = new TextEncoder().encode(JSON.stringify(getShareableSettings()));
const encodedConfig = btoa(String.fromCharCode(...data))
.replace(/\+/g, "-")
.replace(/\//g, "_")
.replace(/=+$/, "");

const studentUrl = new URL(window.location.href);
studentUrl.search = "";
studentUrl.hash = "";
studentUrl.searchParams.set("student", "1");
studentUrl.searchParams.set("config", encodedConfig);

return studentUrl.href;

}

function applyStudentLinkConfig(){

const config = getStudentLinkConfig();

if(!config){
return false;
}

const generationRadio = document.querySelector(
`input[name="generationMode"][value="${config.generationMode}"]`
);

if(generationRadio) generationRadio.checked = true;

const root = document.getElementById("rootSelect");
const mode = document.getElementById("modeSelect");
const bpmSlider = document.getElementById("bpm");
const bpmValue = document.getElementById("bpmValue");
const measureChange = document.getElementById("measureChange");

if(root && config.root) root.value = config.root;
if(mode && config.mode) mode.value = config.mode;

if(bpmSlider && config.bpm){
bpmSlider.value = config.bpm;
renderBpmValue(config.bpm);
setBpm(Number(config.bpm));
}

const volumeControl = document.getElementById("metronomeVolume");
if(config.metronomeVolume !== undefined && volumeControl){
volumeControl.value = config.metronomeVolume;
setMetronomeVolume(Number(config.metronomeVolume) / 100);
}

if(measureChange && config.measureChange){
measureChange.value = config.measureChange;
setMeasureLimit(config.measureChange);
}

const antiRepeat = document.getElementById("antiRepeat");
if(antiRepeat) antiRepeat.checked = config.antiRepeat ?? true;

restoreCheckboxes("#notesSettings input", config.notes);
restoreCheckboxes("#qualitySettings input", config.qualities);
restoreCheckboxes("#stringSettings input", config.strings);
restoreCheckboxes("#zoneSettings input", config.zones);
restoreCheckboxes(".intervalOption", config.intervals);

const intervalGenerationRadio = document.querySelector(`input[name="intervalGenerationMode"][value="${config.intervalGenerationMode}"]`);
if(intervalGenerationRadio) intervalGenerationRadio.checked = true;

[
"showTone",
"showQuality",
"showNext",
"showDegree",
"showString",
"showZone",
"showInterval",
"showPositionAnswer",
"showPitchCheck"
].forEach(id => {
const input = document.getElementById(id);
if(input && typeof config[id] === "boolean") input.checked = config[id];
});

const studentRadio = document.querySelector('input[value="student"]');
if(studentRadio) studentRadio.checked = true;

applyDisplayMode("student");
updateStudentDisplay();
updateToneDisplay();

return true;

}


function saveSettings(){

if(IS_STUDENT){
    console.log("MODE ELEVE : sauvegarde bloquée");
    return;
}


const settings = {

bpm:
document.getElementById("bpm")?.value ?? 80,

metronomeVolume:
document.getElementById("metronomeVolume")?.value ?? 70,


antiRepeat:
document.getElementById("antiRepeat")?.checked ?? true,


generationMode:
document.querySelector(
'input[name="generationMode"]:checked'
)?.value ?? "chromatic",


root:
document.getElementById("rootSelect")?.value ?? "C",


mode:
document.getElementById("modeSelect")?.value ?? "Majeur/Ionien",


notes:
checkedValues("note"),


qualities:
checkedValues("quality"),


strings:
checkedValues("string"),


zones:
checkedValues("zone"),


intervals:
selectedIntervalValues(),

intervalGenerationMode:
document.querySelector('input[name="intervalGenerationMode"]:checked')?.value ?? "chromatic",


measureChange:
document.getElementById("measureChange")?.value ?? "4",


displayMode:
document.querySelector(
'input[name="displayMode"]:checked'
)?.value ?? "teacher",


showTone:
document.getElementById("showTone")?.checked ?? true,

showQuality:
document.getElementById("showQuality")?.checked ?? true,

showMode:
document.getElementById("showMode")?.checked ?? true,

showNext:
document.getElementById("showNext")?.checked ?? true,

showDegree:
document.getElementById("showDegree")?.checked ?? true,

showString:
document.getElementById("showString")?.checked ?? false,

showZone:
document.getElementById("showZone")?.checked ?? false,

showInterval:
document.getElementById("showInterval")?.checked ?? false,

showPositionAnswer:
document.getElementById("showPositionAnswer")?.checked ?? true,

showPitchCheck:
document.getElementById("showPitchCheck")?.checked ?? true

};


console.log("SAUVEGARDE OK :", settings);


localStorage.setItem(
STORAGE_KEY,
JSON.stringify(settings)
);


}



function loadSettings(){


const saved =
localStorage.getItem(STORAGE_KEY);


if(!saved){

if(window.location.search.includes("student")){

applyDisplayMode("student");

}

return;

}


const settings =
JSON.parse(saved);

if(IS_STUDENT){

settings.displayMode = "student";

}

if(
window.location.search.includes("student")
){

const studentRadio =
document.querySelector(
'input[value="student"]'
);


if(studentRadio){

studentRadio.checked = true;

}


applyDisplayMode("student");

}

if(settings.bpm){


document.getElementById("bpm").value =
settings.bpm;


renderBpmValue(settings.bpm);


setBpm(
Number(settings.bpm)
);


}

if(settings.metronomeVolume !== undefined){
const volumeControl = document.getElementById("metronomeVolume");
if(volumeControl){
volumeControl.value = settings.metronomeVolume;
setMetronomeVolume(Number(settings.metronomeVolume) / 100);
}
}



const antiRepeat = document.getElementById("antiRepeat");

if(antiRepeat){
    antiRepeat.checked = settings.antiRepeat;
}


const measureChange = document.getElementById("measureChange");

if(measureChange && settings.measureChange){
    measureChange.value = settings.measureChange;
    setMeasureLimit(settings.measureChange);
}



const root =
document.getElementById("rootSelect");

const mode =
document.getElementById("modeSelect");


if(root && settings.root){

root.value = settings.root;

}


if(mode && settings.mode){

mode.value = settings.mode;

}

if(root && mode){

    updateToneDisplay();

}



const radio =
document.querySelector(
`input[value="${settings.generationMode}"]`
);


if(radio){
radio.checked=true;
}



restoreCheckboxes(
"#notesSettings input",
settings.notes
);


restoreCheckboxes(
"#qualitySettings input",
settings.qualities
);


restoreCheckboxes(
"#stringSettings input",
settings.strings
);


restoreCheckboxes(
"#zoneSettings input",
settings.zones
);


restoreCheckboxes(
".intervalOption",
settings.intervals
);

const intervalGenerationRadio = document.querySelector(
`input[name="intervalGenerationMode"][value="${settings.intervalGenerationMode}"]`
);

if(intervalGenerationRadio){
intervalGenerationRadio.checked = true;
}

const displayRadio =
document.querySelector(
`input[value="${settings.displayMode}"]`
);

if(displayRadio){

displayRadio.checked=true;

applyDisplayMode(
settings.displayMode
);

}


const showTone =
document.getElementById("showTone");

if(showTone){
    showTone.checked =
    settings.showTone ?? true;
}


const showQuality =
document.getElementById("showQuality");

if(showQuality){
    showQuality.checked =
    settings.showQuality ?? true;
}


const showMode =
document.getElementById("showMode");

if(showMode){
    showMode.checked =
    settings.showMode ?? true;
}


const showNext =
document.getElementById("showNext");

if(showNext){
    showNext.checked =
    settings.showNext ?? true;
}


const showDegree =
document.getElementById("showDegree");

if(showDegree){
    showDegree.checked =
    settings.showDegree ?? true;
}


const showString =
document.getElementById("showString");

if(showString){
    showString.checked =
    settings.showString ?? settings.showDetails ?? false;
}


const showZone =
document.getElementById("showZone");

if(showZone){
    showZone.checked =
    settings.showZone ?? settings.showDetails ?? false;
}


const showInterval =
document.getElementById("showInterval");

if(showInterval){
    showInterval.checked =
    settings.showInterval ?? false;
}

const showPositionAnswer =
document.getElementById("showPositionAnswer");

if(showPositionAnswer){
    showPositionAnswer.checked =
    settings.showPositionAnswer ?? true;
}

const showPitchCheck =
document.getElementById("showPitchCheck");

if(showPitchCheck){
    showPitchCheck.checked =
    settings.showPitchCheck ?? true;
}

updateStudentDisplay();

updateToneDisplay();
}



function restoreCheckboxes(selector,values){


if(!values) return;


document
.querySelectorAll(selector)
.forEach(box=>{


box.checked =
values.includes(box.value);


});


}
