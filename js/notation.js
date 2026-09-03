// NeckLab - Musical Notation Engine


const noteSpellings = {

"C": [
"C",
"D",
"E",
"F",
"G",
"A",
"B"
],


"G": [
"G",
"A",
"B",
"C",
"D",
"E",
"F#"
],


"D": [
"D",
"E",
"F#",
"G",
"A",
"B",
"C#"
],


"A": [
"A",
"B",
"C#",
"D",
"E",
"F#",
"G#"
],


"E": [
"E",
"F#",
"G#",
"A",
"B",
"C#",
"D#"
],


"B": [
"B",
"C#",
"D#",
"E",
"F#",
"G#",
"A#"
],


"F": [
"F",
"G",
"A",
"Bb",
"C",
"D",
"E"
],


"Bb": [
"Bb",
"C",
"D",
"Eb",
"F",
"G",
"A"
],


"Eb": [
"Eb",
"F",
"G",
"Ab",
"Bb",
"C",
"D"
],


"Ab": [
"Ab",
"Bb",
"C",
"Db",
"Eb",
"F",
"G"
]

};



function getPreferredNotes(root){


return noteSpellings[root] || null;


}