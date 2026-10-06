// Manche virtuel : un repère tactile et sonore pour pratiquer sans guitare.

const guitarNoteNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

function virtualGuitarNoteName(midi){
    return guitarNoteNames[((midi % 12) + 12) % 12];
}

function playVirtualGuitarNote(midi){
    initAudio();
    const start = audioContext.currentTime;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const output = audioContext.createGain();
    output.gain.setValueAtTime(.0001, start);
    output.gain.exponentialRampToValueAtTime(.16, start + .008);
    output.gain.exponentialRampToValueAtTime(.0001, start + 1.15);
    output.connect(audioContext.destination);

    [[1, .9], [2, .18], [3, .06]].forEach(([ratio, level]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency * ratio, start);
        gain.gain.value = level;
        oscillator.connect(gain);
        gain.connect(output);
        oscillator.start(start);
        oscillator.stop(start + 1.2);
    });
}

function clearVirtualFretboardFeedback(){
    document.querySelectorAll(".virtual-fretboard__cell, .virtual-fretboard__string-label").forEach(cell => cell.classList.remove("is-correct", "is-incorrect", "is-selected"));
}

function handleVirtualFretClick(button){
    const midi = Number(button.dataset.midi);
    const target = previous ? getPitchClass(previous.note) : null;
    const isCorrect = target !== null && target >= 0 && midi % 12 === target;
    const status = document.getElementById("virtualFretboardStatus");

    clearVirtualFretboardFeedback();
    button.classList.add("is-selected", isCorrect ? "is-correct" : "is-incorrect");
    status.textContent = isCorrect ? "Position juste" : "Position sélectionnée";
    status.dataset.state = isCorrect ? "correct" : "trying";
    playVirtualGuitarNote(midi);
}

function renderGuitarNeck(){
    const grid = document.getElementById("virtualFretboardGrid");
    if(!grid || typeof standardTuning === "undefined") return;

    const strings = Object.entries(standardTuning).reverse();
    grid.replaceChildren(...strings.flatMap(([stringName, openMidi]) => {
        const stringNumber = stringName.replace("Corde ", "");
        const label = document.createElement("button");
        label.type = "button";
        label.className = "virtual-fretboard__string-label";
        label.textContent = stringNumber;
        label.dataset.midi = String(openMidi);
        label.setAttribute("aria-label", `${stringName}, à vide · ${virtualGuitarNoteName(openMidi)}`);
        label.title = `${stringName} · à vide`;
        label.addEventListener("click", () => handleVirtualFretClick(label));

        return [label, ...Array.from({ length: 12 }, (_, index) => {
            const fret = index + 1;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "virtual-fretboard__cell";
            button.dataset.midi = String(openMidi + fret);
            button.dataset.fret = String(fret);
            button.setAttribute("aria-label", `${stringName}, ${fret === 0 ? "à vide" : "case " + fret} · ${virtualGuitarNoteName(openMidi + fret)}`);
            button.title = `${stringName} · ${fret === 0 ? "à vide" : "case " + fret}`;
            button.addEventListener("click", () => handleVirtualFretClick(button));
            return button;
        })];
    }));

    const markers = document.getElementById("virtualFretboardMarkers");
    markers?.replaceChildren(...Array.from({ length: 13 }, (_, index) => {
        const marker = document.createElement("span");
        const fret = index;
        marker.textContent = [3, 5, 7, 9, 12].includes(fret) ? String(fret) : "";
        return marker;
    }));

    const inlays = document.getElementById("virtualFretboardInlays");
    inlays?.replaceChildren(...[3, 5, 7, 9, 12].map(fret => {
        const inlay = document.createElement("span");
        inlay.className = "virtual-fretboard__inlay" + (fret === 12 ? " is-octave" : "");
        inlay.style.gridColumn = String(fret + 1);
        inlay.innerHTML = fret === 12 ? "<i></i><i></i>" : "<i></i>";
        return inlay;
    }));
}

renderGuitarNeck();
