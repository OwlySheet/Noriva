// NeckLab - Harmony Engine


const notes = [
"C",
"C#/Db",
"D",
"D#/Eb",
"E",
"F",
"F#/Gb",
"G",
"G#/Ab",
"A",
"A#/Bb",
"B"
];

const sharpNotes = [
"C",
"C#",
"D",
"D#",
"E",
"F",
"F#",
"G",
"G#",
"A",
"A#",
"B"
];


const flatNotes = [
"C",
"Db",
"D",
"Eb",
"E",
"F",
"Gb",
"G",
"Ab",
"A",
"Bb",
"B"
];

const flatKeys = [
"F",
"Bb",
"Eb",
"Ab",
"Db",
"Gb",
];

function shouldUseFlats(scaleNotes){

return scaleNotes.some(note =>
[
"Bb",
"Eb",
"Ab",
"Db",
"Gb",
"Cb"
].includes(note)
);

}


const qualities = [
"Maj",
"min",
"7",
"maj7",
"m7",
"mMaj7",
"maj7#5",
"dim",
"dim7",
"m7♭5",
"aug",
"sus2",
"sus4"
];

function formatChordQuality(quality){
    return ({
        Maj: "",
        min: "−",
        "7": "7",
        maj7: "Δ",
        m7: "−7",
        mMaj7: "−Δ",
        "maj7#5": "Δ♯5",
        dim: "°",
        dim7: "°7",
        "m7♭5": "Ø",
        m7b5: "Ø",
        aug: "+",
        sus2: "Sus2",
        sus4: "Sus4"
    })[quality] ?? quality;
}

const modes = {

    "Majeur/Ionien": [
        0,2,4,5,7,9,11
    ],

    "Dorien": [
        0,2,3,5,7,9,10
    ],

    "Phrygien": [
        0,1,3,5,7,8,10
    ],

    "Lydien": [
        0,2,4,6,7,9,11
    ],

    "Mixolydien": [
        0,2,4,5,7,9,10
    ],

    "Mineur/Aeolien": [
        0,2,3,5,7,8,10
    ],

    "Locrien": [
        0,1,3,5,6,8,10
    ],

    "Mineur harmonique": [
        0,2,3,5,7,8,11
    ],

    "Locrien ♮6": [
        0,1,3,5,6,9,10
    ],

    "Ionien ♯5": [
        0,2,4,5,8,9,11
    ],

    "Dorien ♯4": [
        0,2,3,6,7,9,10
    ],

    "Phrygien dominant": [
        0,1,4,5,7,8,10
    ],

    "Lydien ♯2": [
        0,3,4,6,7,9,11
    ],

    "Ultra Locrien": [
        0,1,3,5,6,8,9
    ],

    "Mineur mélodique": [
        0,2,3,5,7,9,11
    ],

    "Dorien ♭2": [
        0,1,3,5,7,9,10
    ],

    "Lydien augmenté": [
        0,2,4,6,8,9,11
    ],

    "Lydien dominant": [
        0,2,4,6,7,9,10
    ],

    "Mixolydien ♭6": [
        0,2,4,5,7,8,10
    ],

    "Locrien ♮2": [
        0,2,3,5,6,8,10
    ],

    "Altéré": [
        0,1,3,4,6,8,10
    ]

};

// Degrés modaux, exprimés par rapport à la gamme majeure parallèle.
// La qualité de l'accord n'intervient volontairement pas dans cet affichage.
const modalDegrees = {
"Majeur/Ionien": ["I", "II", "III", "IV", "V", "VI", "VII"],
"Dorien": ["I", "II", "♭III", "IV", "V", "VI", "♭VII"],
"Phrygien": ["I", "♭II", "♭III", "IV", "V", "♭VI", "♭VII"],
"Lydien": ["I", "II", "III", "♯IV", "V", "VI", "VII"],
"Mixolydien": ["I", "II", "III", "IV", "V", "VI", "♭VII"],
"Mineur/Aeolien": ["I", "II", "♭III", "IV", "V", "♭VI", "♭VII"],
"Locrien": ["I", "♭II", "♭III", "IV", "♭V", "♭VI", "♭VII"],
"Mineur harmonique": ["I", "II", "♭III", "IV", "V", "♭VI", "VII"],
"Locrien ♮6": ["I", "♭II", "♭III", "IV", "♭V", "VI", "♭VII"],
"Ionien ♯5": ["I", "II", "III", "IV", "♯V", "VI", "VII"],
"Dorien ♯4": ["I", "II", "♭III", "♯IV", "V", "VI", "♭VII"],
"Phrygien dominant": ["I", "♭II", "III", "IV", "V", "♭VI", "♭VII"],
"Lydien ♯2": ["I", "♯II", "III", "♯IV", "V", "VI", "VII"],
"Ultra Locrien": ["I", "♭II", "♭III", "IV", "♭V", "♭VI", "♭♭VII"],
"Mineur mélodique": ["I", "II", "♭III", "IV", "V", "VI", "VII"],
"Dorien ♭2": ["I", "♭II", "♭III", "IV", "V", "VI", "♭VII"],
"Lydien augmenté": ["I", "II", "III", "♯IV", "♯V", "VI", "VII"],
"Lydien dominant": ["I", "II", "III", "♯IV", "V", "VI", "♭VII"],
"Mixolydien ♭6": ["I", "II", "III", "IV", "V", "♭VI", "♭VII"],
"Locrien ♮2": ["I", "II", "♭III", "IV", "♭V", "♭VI", "♭VII"],
"Altéré": ["I", "♭II", "♯II", "III", "♭V", "♯V", "♭VII"]
};

function getModalDegree(mode, index){

const degree = modalDegrees[mode]?.[index];

return degree ? `(${degree})` : "";

}



const chromaticNotes = [

"C",
"C#",
"D",
"D#",
"E",
"F",
"F#",
"G",
"G#",
"A",
"A#",
"B"

];


const naturalPitchClasses = {
"C": 0,
"D": 2,
"E": 4,
"F": 5,
"G": 7,
"A": 9,
"B": 11
};

const noteLetters = ["C", "D", "E", "F", "G", "A", "B"];

function getPitchClass(note){

const letter = note?.[0];

if(!Object.hasOwn(naturalPitchClasses, letter)){
return -1;
}

let pitch = naturalPitchClasses[letter];

for(const accidental of note.slice(1)){
if(accidental === "#") pitch++;
if(accidental === "b") pitch--;
}

return (pitch + 12) % 12;

}

function spellNote(letter, pitchClass){

const naturalPitch = naturalPitchClasses[letter];
let difference = (pitchClass - naturalPitch + 12) % 12;

// Avec les tonalités proposées, une écriture diatonique nécessite au plus
// un double dièse ou un double bémol.
if(difference > 6) difference -= 12;

if(difference > 0) return letter + "#".repeat(difference);
if(difference < 0) return letter + "b".repeat(-difference);

return letter;

}

const scaleSpellings = {

"C":[
"C","D","E","F","G","A","B"
],

"G":[
"G","A","B","C","D","E","F#"
],

"D":[
"D","E","F#","G","A","B","C#"
],

"A":[
"A","B","C#","D","E","F#","G#"
],

"E":[
"E","F#","G#","A","B","C#","D#"
],

"B":[
"B","C#","D#","E","F#","G#","A#"
],

"F#":[
"F#","G#","A#","B","C#","D#","E#"
],

"C#":[
"C#","D#","E#","F#","G#","A#","B#"
],


"F":[
"F","G","A","Bb","C","D","E"
],

"Bb":[
"Bb","C","D","Eb","F","G","A"
],

"Eb":[
"Eb","F","G","Ab","Bb","C","D"
],

"Ab":[
"Ab","Bb","C","Db","Eb","F","G"
],

"Db":[
"Db","Eb","F","Gb","Ab","Bb","C"
],

"Gb":[
"Gb","Ab","Bb","Cb","Db","Eb","F"
]

};



function getScale(root, mode){

const rootPitch = getPitchClass(root);
const rootLetterIndex = noteLetters.indexOf(root[0]);
const intervals = modes[mode];

if(rootPitch === -1 || rootLetterIndex === -1 || !intervals){
return [];
}

// Chaque degré utilise sa propre lettre : cela évite, par exemple, d'écrire
// Gb à la place de F# dans la gamme de Mi lydien.
return intervals.map((interval, degree) => {
const letter = noteLetters[(rootLetterIndex + degree) % noteLetters.length];
return spellNote(letter, (rootPitch + interval) % 12);
});


}

function detectChordQuality(scale, index){


const rootIndex = index;

const third =
scale[(rootIndex + 2) % 7];

const fifth =
scale[(rootIndex + 4) % 7];

const seventh =
scale[(rootIndex + 6) % 7];



const rootNote = getPitchClass(scale[rootIndex]);

const thirdNote = getPitchClass(third);

const fifthNote = getPitchClass(fifth);

const seventhNote = getPitchClass(seventh);



const intervals = [

(thirdNote - rootNote + 12) % 12,

(fifthNote - rootNote + 12) % 12,

(seventhNote - rootNote + 12) % 12

];



const key =
intervals.join(",");



const qualities = {

"4,7,11":"maj7",

"4,8,11":"maj7#5",

"3,7,10":"m7",

"3,7,11":"mMaj7",

"4,7,10":"7",

"3,6,10":"m7b5",

"3,6,9":"dim7"

};



return qualities[key] || "?";

}

function buildDiatonicChords(scale, mode){



const chordQualities = {


"Majeur/Ionien": [
"maj7",
"m7",
"m7",
"maj7",
"7",
"m7",
"m7b5"
],


"Dorien": [
"m7",
"m7",
"maj7",
"7",
"m7",
"m7b5",
"maj7"
],


"Phrygien": [
"m7",
"maj7",
"7",
"m7",
"m7b5",
"maj7",
"m7"
],


"Lydien": [
"maj7",
"7",
"m7",
"m7b5",
"maj7",
"m7",
"m7"
],


"Mixolydien": [
"7",
"m7",
"m7b5",
"maj7",
"m7",
"m7",
"maj7"
],


"Mineur/Aeolien": [
"m7",
"m7b5",
"maj7",
"m7",
"m7",
"maj7",
"7"
],


"Locrien": [
"m7b5",
"maj7",
"m7",
"m7",
"7",
"maj7",
"m7"
],

"Mineur harmonique": [
"mMaj7",
"m7b5",
"maj7#5",
"m7",
"7",
"maj7",
"dim7"
],

"Locrien ♮6": [
"m7b5",
"maj7#5",
"m7",
"7",
"maj7",
"dim7",
"mMaj7"
],

"Ionien ♯5": [
"maj7#5",
"m7",
"7",
"maj7",
"dim7",
"mMaj7",
"m7b5"
],

"Dorien ♯4": [
"m7",
"7",
"maj7",
"dim7",
"mMaj7",
"m7b5",
"maj7#5"
],

"Phrygien dominant": [
"7",
"maj7",
"dim7",
"mMaj7",
"m7b5",
"maj7#5",
"m7"
],

"Lydien ♯2": [
"maj7",
"dim7",
"mMaj7",
"m7b5",
"maj7#5",
"m7",
"7"
],

"Ultra Locrien": [
"dim7",
"mMaj7",
"m7b5",
"maj7#5",
"m7",
"7",
"maj7"
],

"Mineur mélodique": [
"mMaj7",
"m7",
"maj7#5",
"7",
"7",
"m7b5",
"m7b5"
],

"Dorien ♭2": [
"m7",
"maj7#5",
"7",
"7",
"m7b5",
"m7b5",
"mMaj7"
],

"Lydien augmenté": [
"maj7#5",
"7",
"7",
"m7b5",
"m7b5",
"mMaj7",
"m7"
],

"Lydien dominant": [
"7",
"7",
"m7b5",
"m7b5",
"mMaj7",
"m7",
"maj7#5"
],

"Mixolydien ♭6": [
"7",
"m7b5",
"m7b5",
"mMaj7",
"m7",
"maj7#5",
"7"
],

"Locrien ♮2": [
"m7b5",
"m7b5",
"mMaj7",
"m7",
"maj7#5",
"7",
"7"
],

"Altéré": [
"m7b5",
"mMaj7",
"m7",
"maj7#5",
"7",
"7",
"m7b5"
]


};


return scale.map((note,index)=>{


return {

root: note,

quality:
chordQualities[mode][index],

degree: getModalDegree(mode, index)

};


});


}
