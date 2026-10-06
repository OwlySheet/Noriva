// NeckLab - Exercise Generator


let previous = null;
let nextExercise = null;

const standardTuning = {
"Corde 6": 40,
"Corde 5": 45,
"Corde 4": 50,
"Corde 3": 55,
"Corde 2": 59,
"Corde 1": 64
};



function random(array){

return array[
Math.floor(Math.random() * array.length)
];

}

// Les notes chromatiques enharmoniques sont stockées sous la forme "C#/Db".
// À chaque exercice, on choisit une seule des deux écritures possibles.
function randomEnharmonicSpelling(note){

const spellings = note.split("/");

return random(spellings);

}

function noteIdentity(note){

return note.split("/")[0];

}

// Deux écritures différentes peuvent désigner la même hauteur (C♯ / D♭).
// La répétition se vérifie donc à l'oreille, par classe de hauteur, et non
// uniquement à partir du texte affiché.
function notePitchClass(note){
const spelling = note?.split("/")[0];
return typeof getPitchClass === "function" ? getPitchClass(spelling) : spelling;
}

function isSameGeneratedNote(first, second){
if(!first || !second) return false;
return notePitchClass(first) === notePitchClass(second);
}

function getDegreeColorClass(quality){

if(["dim", "dim7", "m7b5", "m7♭5"].includes(quality)){
return "degree--diminished";
}

if(quality === "7"){
return "degree--dominant";
}

if(["min", "m7", "mMaj7"].includes(quality)){
return "degree--minor";
}

return "degree--major";

}



function createExercise(excludedNote = null){


const generationMode =
document.querySelector(
'input[name="generationMode"]:checked'
)?.value ?? "random";


const availableQualities =
checkedValues("quality");


const availableStrings =
checkedValues("string");


const availableZones =
checkedValues("zone");


let note;
let quality;
let degree = "";
let string;
let zone;


if(generationMode === "diatonic"){


const root =
document.getElementById("rootSelect").value;


const mode =
document.getElementById("modeSelect").value;


const scale =
getScale(
root,
mode
);


const chordPool =
buildDiatonicChords(
scale,
mode
);


const eligibleChords = chordPool.filter(chord => !isSameGeneratedNote(chord.root, excludedNote));
const chord = random(eligibleChords.length ? eligibleChords : chordPool);


note =
chord.root;


quality =
chord.quality;

degree =
chord.degree;


}


else{


const availableNotes = checkedValues("note");
const eligibleNotes = availableNotes.filter(candidate => !isSameGeneratedNote(candidate, excludedNote));


note = randomEnharmonicSpelling(random(eligibleNotes.length ? eligibleNotes : availableNotes));


quality =
random(availableQualities);


}


return {

note,

quality,

degree,

string: random(availableStrings),

zone: random(availableZones)

};


}




function display(ex){

hidePositionAnswer();


const degreeBlock =
document.getElementById("degreeBlock");


document.getElementById("degreeDisplay").textContent =
ex.degree;


degreeBlock.style.display =
ex.degree && document.getElementById("showDegree").checked
? "block"
: "none";


degreeBlock.className =
"degree " + getDegreeColorClass(ex.quality);


document.getElementById("note").textContent =
ex.note;


document.getElementById("quality").textContent =
formatChordQuality(ex.quality);


document.getElementById("stringBlock").textContent =
document.documentElement.lang === "en" ? ex.string.replace("Corde", "String") : ex.string;


document.getElementById("zoneBlock").textContent =
ex.zone;


}

function getFretForExercise(ex){
const openStringMidi = standardTuning[ex.string];
if(openStringMidi === undefined) return null;
const targetPitch = getPitchClass(ex.note);
return (targetPitch - (openStringMidi % 12) + 12) % 12;
}

function hidePositionAnswer(){
const answer = document.getElementById("positionAnswer");
if(answer) {
answer.hidden = true;
answer.textContent = "";
}
}

function revealPositionAnswer(){
const answer = document.getElementById("positionAnswer");
if(!answer || !previous || !document.getElementById("showPositionAnswer")?.checked) return false;
const fret = getFretForExercise(previous);
if(fret === null) return false;
answer.textContent = "Case " + fret;
answer.hidden = false;
return true;
}


function displayNextExercise(){

if(!nextExercise) return;

const showQuality =
document.getElementById("showQuality")?.checked ?? true;

document.getElementById("nextExercise").textContent =
nextExercise.note
+
(showQuality ? " " + formatChordQuality(nextExercise.quality) : "");

}




function generate(){

updateToneDisplay();

let current = nextExercise;





if(!current){
current = createExercise(previous?.note ?? null);
}



previous =
current;



let intervalTarget =
getRandomInterval(current.quality);

current.interval =
intervalTarget;



display(current);




if(current.interval){


document.getElementById("intervalDisplay").textContent =

"Trouver : "
+
current.interval.label;


}




nextExercise = createExercise(current.note);



displayNextExercise();


}
