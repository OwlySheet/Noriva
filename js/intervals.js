const intervalNames = {

1:"1",

"b2":"♭2",

2:"2",

"b3":"♭3",

3:"3",

4:"4",

"#4":"♯4",

"b5":"♭5",

5:"5",

"b6":"♭6",

6:"6",

"b7":"♭7",

7:"7",

"b9":"♭9",
"#9":"♯9",
9:"9",
11:"11",
"#11":"♯11",
"b13":"♭13",
13:"13",
"#5":"♯5"

};

const chordIntervalVocabulary = {
Maj: ["3", "5", "9", "11", "13"],
min: ["b3", "5", "9", "11", "b13"],
"7": ["3", "5", "b7", "b9", "#9", "#11", "b13", "13"],
maj7: ["3", "5", "7", "9", "#11", "13"],
m7: ["b3", "5", "b7", "9", "11", "13"],
mMaj7: ["b3", "5", "7", "9", "11", "b13"],
"maj7#5": ["3", "#5", "7", "9", "#11", "13"],
dim: ["b3", "b5", "6"],
dim7: ["b3", "b5", "6"],
"m7♭5": ["b3", "b5", "b7", "b9", "11", "b13"],
m7b5: ["b3", "b5", "b7", "b9", "11", "b13"],
aug: ["3", "#5", "9", "#11"],
sus2: ["2", "5", "b7", "9", "11", "13"],
sus4: ["4", "5", "b7", "9", "13"]
};

const chordIntervalLabels = {
"1": "Fondamentale",
"2": "2M",
"b3": "3m",
"3": "3M",
"4": "4J",
"b5": "♭5",
"5": "5J",
"#5": "♯5",
"6": "6M",
"b7": "♭7",
"7": "7M",
"b9": "♭9",
"#9": "♯9",
"9": "9M",
"11": "11J",
"#11": "♯11",
"b13": "♭13",
"13": "13M"
};

function formatInterval(interval, quality){


if(interval===3){


if(
quality.includes("min")
||
quality.includes("m")
){

return "♭3";

}

return "3";

}



if(interval===7){


if(
quality.includes("maj7")
){

return "7";

}


return "♭7";

}



return intervalNames[interval];

}



function getIntervalGenerationMode(){
return document.querySelector('input[name="intervalGenerationMode"]:checked')?.value ?? "chromatic";
}

function getRandomInterval(quality = "Maj"){

if(getIntervalGenerationMode() === "chord"){
const options = chordIntervalVocabulary[quality] || chordIntervalVocabulary.Maj;
const value = options[Math.floor(Math.random() * options.length)];
return { value, name: intervalNames[value], label: chordIntervalLabels[value] || intervalNames[value] };
}


const options =
[...document.querySelectorAll(".intervalOption:checked")];


const choice = options.length
? options[Math.floor(Math.random()*options.length)]
: { value: "1" };


return {

value:
choice.value,

name:
intervalNames[choice.value],

label:
formatInterval(choice.value, quality)

};


}
