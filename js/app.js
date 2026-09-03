
document
.querySelectorAll("input,select")
.forEach(element=>{


element.addEventListener(
"change",
saveSettings
);


});


function checkedValues(prefix){

return [

...document.querySelectorAll(
`input[id^="${prefix}"]:checked`
)

].map(x=>x.value);

}


console.log(
"ROUE TROUVÉE :",
document.getElementById("settingsGear")
);


// METRONOME CONTROLS


const bpmSlider =
document.getElementById("bpm");


const bpmValue =
document.getElementById("bpmValue");


const metroButton =
document.getElementById("metroButton");



bpmSlider.addEventListener(
"input",
()=>{


setBpm(
Number(bpmSlider.value)
);


renderBpmValue(bpmSlider.value);


saveSettings();


});



metroButton.addEventListener(
"click",
()=>{


if(metronomeRunning){


stopMetronome();


metroButton.textContent =
"▶ Démarrer";


}

else{


startMetronome();


metroButton.textContent =
"⏸ Arrêter";


}


});

const measureSelect =
document.getElementById("measureChange");



measureSelect.addEventListener(
"change",
()=>{


setMeasureLimit(
measureSelect.value
);


});


const createStudentLinkButton =
document.getElementById("createStudentLink");

const studentLinkOutput =
document.getElementById("studentLinkOutput");

const copyStudentLinkButton =
document.getElementById("copyStudentLink");


if(createStudentLinkButton && studentLinkOutput){

createStudentLinkButton.addEventListener("click", ()=>{

studentLinkOutput.value = createStudentLink();

if(copyStudentLinkButton){
copyStudentLinkButton.hidden = false;
copyStudentLinkButton.textContent = "Copier le lien";
}

});

}


if(copyStudentLinkButton && studentLinkOutput){

copyStudentLinkButton.addEventListener("click", async ()=>{

studentLinkOutput.select();

try {
await navigator.clipboard.writeText(studentLinkOutput.value);
} catch(error) {
document.execCommand("copy");
}

copyStudentLinkButton.textContent = "Lien copié";

});

}

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

console.log("NECKLAB START");

initSettings();

loadSettings();

applyStudentLinkConfig();

updateStudentDisplay();

generate();
