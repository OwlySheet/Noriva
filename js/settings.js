// NeckLab - Settings System


function updateStudentDisplay(){


const showTone =
document.getElementById("showTone");

const showQuality =
document.getElementById("showQuality");

const showNext =
document.getElementById("showNext");

const showDegree =
document.getElementById("showDegree");

const showString =
document.getElementById("showString");

const showZone =
document.getElementById("showZone");

const showInterval =
document.getElementById("showInterval");

const showPitchCheck =
document.getElementById("showPitchCheck");

const showFretboard =
document.getElementById("showFretboard");



const toneBlock =
document.getElementById("toneBlock");

const nextBlock =
document.getElementById("nextBlock");

const detailsBlock =
document.getElementById("detailsBlock");

const degreeBlock =
document.getElementById("degreeBlock");

const stringBlock =
document.getElementById("stringBlock");

const zoneBlock =
document.getElementById("zoneBlock");

const detailsSeparator =
document.getElementById("detailsSeparator");

const intervalBlock =
document.getElementById("intervalBlock");

const qualityDisplay =
document.getElementById("quality");

const pitchCheckPanel =
document.getElementById("pitchCheckPanel");

const virtualFretboard =
document.getElementById("virtualFretboard");



if(showTone && toneBlock){

toneBlock.style.display =
showTone.checked ? "block" : "none";

}


if(showQuality && qualityDisplay){

qualityDisplay.style.display =
showQuality.checked ? "block" : "none";

if(typeof displayNextExercise === "function"){
displayNextExercise();
}

}


if(showNext && nextBlock){

nextBlock.style.display =
showNext.checked ? "block" : "none";

}


if(showDegree && degreeBlock){

const isDiatonic = document.querySelector(
'input[name="generationMode"]:checked'
)?.value === "diatonic";

degreeBlock.style.display =
showDegree.checked && isDiatonic ? "block" : "none";

}


if(showString && stringBlock){

stringBlock.style.display =
showString.checked ? "inline" : "none";

}


if(showZone && zoneBlock){

zoneBlock.style.display =
showZone.checked ? "inline" : "none";

}


if(detailsSeparator){

detailsSeparator.style.display =
showString?.checked && showZone?.checked ? "inline" : "none";

}


if(detailsBlock){

detailsBlock.style.display =
showString?.checked || showZone?.checked ? "block" : "none";

}


if(showInterval && intervalBlock){

intervalBlock.style.display =
showInterval.checked ? "block" : "none";

}

if(showPitchCheck && pitchCheckPanel){
pitchCheckPanel.hidden = !showPitchCheck.checked;
if(!showPitchCheck.checked && typeof stopPitchChecking === "function") stopPitchChecking();
}

if(showFretboard && virtualFretboard){
virtualFretboard.hidden = !showFretboard.checked;
}


}





function refreshDiatonicExercise(){

if(document.querySelector('input[name="generationMode"]:checked')?.value !== "diatonic") return;

previous = null;
nextExercise = null;
generate();

}

function updateToneDisplay(){


const root =
document.getElementById("rootSelect");

const mode =
document.getElementById("modeSelect");

const toneBlock =
document.getElementById("toneBlock");

const toneDisplay =
document.getElementById("toneDisplay");

const showTone =
document.getElementById("showTone");


const generationMode =
document.querySelector(
'input[name="generationMode"]:checked'
)?.value;



if(!root || !mode || !toneBlock || !toneDisplay){

return;

}



// Mode chromatique : pas de tonalité

if(generationMode === "chromatic"){

toneBlock.style.display="none";

return;

}



// Option utilisateur

if(showTone && !showTone.checked){

toneBlock.style.display="none";

return;

}



toneBlock.style.display="block";


toneDisplay.textContent =
(root.value || "")
+
" "
+
(mode.value || "");


}







function applyDisplayMode(mode){


const panel =
document.getElementById("settingsPanel");


const gear =
document.getElementById("settingsGear");


const studentLink =
new URLSearchParams(window.location.search).has("student") ||
new URLSearchParams(window.location.search).has("s");



if(!panel) return;



// Vrai lien élève = bloqué définitivement

if(studentLink){


document.body.classList.add(
"student-mode"
);


panel.style.display="none";


if(gear){

gear.style.display="none";

}


return;

}




// Passage manuel élève/prof

if(mode === "student"){


document.body.classList.add(
"student-mode"
);


panel.style.display="none";


// Mode élève manuel : on garde la roue pour pouvoir revenir prof

if(gear){

gear.style.display="block";

}


}

else{


document.body.classList.remove(
"student-mode"
);


panel.style.display="block";


if(gear){

gear.style.display="block";

}


}


}







function initSettings(){


console.log("INIT SETTINGS APPELÉ");



const gear =
document.getElementById("settingsGear");


const panel =
document.getElementById("settingsPanel");



if(gear && panel){


gear.addEventListener(
"click",
()=>{


console.log("OUVERTURE REGLAGES");


const isStudentMode =
document.body.classList.contains("student-mode");


applyDisplayMode(
isStudentMode ? "teacher" : "student"
);


});


}





document
.querySelectorAll(
"#showTone,#showQuality,#showNext,#showDegree,#showString,#showZone,#showInterval,#showPositionAnswer,#showPitchCheck,#showFretboard"
)
.forEach(input=>{


input.addEventListener(
"change",
()=>{


updateStudentDisplay();

saveSettings();


});

document
.querySelectorAll('input[name="intervalGenerationMode"]')
.forEach(input=>{
input.addEventListener("change", ()=>{
generate();
saveSettings();
});
});


});







document
.querySelectorAll(
'input[name="generationMode"]'
)
.forEach(input=>{


input.addEventListener(
"change",
()=>{


updateToneDisplay();

saveSettings();

refreshDiatonicExercise();


});


});







document
.querySelectorAll(
'input[name="displayMode"]'
)
.forEach(input=>{


input.addEventListener(
"change",
()=>{


applyDisplayMode(
input.value
);


saveSettings();


});


});







const root =
document.getElementById("rootSelect");


const mode =
document.getElementById("modeSelect");



if(root){

root.addEventListener(
"change",
()=>{

updateToneDisplay();

saveSettings();

refreshDiatonicExercise();

}
);

}



if(mode){

mode.addEventListener(
"change",
()=>{

updateToneDisplay();

saveSettings();

refreshDiatonicExercise();

}
);

}



}
