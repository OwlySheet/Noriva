(() => {
    const storageKey = "necklab-language";
    const frToEn = {
        "RÉÉCOUTER": "LISTEN AGAIN",
        "Observe": "Visualize",
        "Écoute": "Hear",
        "Comprend": "Understand",
        "Outils": "Tools",
        "Démarrer": "Start",
        "Arrêter": "Stop",
        "Réglages": "Settings",
        "Exercice": "Exercise",
        "Note isolée": "Single note",
        "Intervalle": "Interval",
        "Accord": "Chord",
        "Gamme et mode": "Scale and mode",
        "Réponses": "Answers",
        "Métronome": "Metronome",
        "Durée de la session": "Session duration",
        "ÉCOUTE ET RETROUVE LA NOTE": "LISTEN AND FIND THE NOTE",
        "CHAPITRE I": "CHAPTER I",
        "LES INTERVALLES": "THE INTERVALS",
        "CHAPITRE I · LES INTERVALLES": "CHAPTER I · INTERVALS",
        "La distance entre deux notes": "The distance between two notes",
        "Mesurer un intervalle": "Measuring an interval",
        "L’octave": "The octave",
        "Nommer la taille exacte": "Naming the exact size",
        "Tons et altérations": "Tones and accidentals",
        "ton": "Whole step",
        "demi-ton": "Half step",
        "tons": "whole steps",
        "demi-tons": "half steps",
        "Ton": "Whole step",
        "Demi-ton": "Half step",
        "Accord": "Chord",
        "accord": "chord",
        "Accords": "Chords",
        "accords": "chords",
        "Gamme": "Scale",
        "gamme": "scale",
        "Gammes": "Scales",
        "gammes": "scales",
        "Tonalité": "Key",
        "tonalité": "key",
        "Tonalités": "Keys",
        "tonalités": "keys",
        "Note": "Note",
        "note": "note",
        "Notes": "Notes",
        "notes": "notes",
        "Degré": "Degree",
        "degré": "degree",
        "Degrés": "Degrees",
        "degrés": "degrees",
        "Les familles": "The families",
        "Calculateur d’intervalle": "Interval calculator",
        "Calculateur de degrés": "Degree calculator",
        "Constructeur de grille": "Progression builder",
        "Analyseur d’intervalle": "Interval analyser",
        "Note d’arrivée": "Target note",
        "Outils interactifs": "Interactive tools",
        "Explore les intervalles, les accords, les modes et les progressions.": "Explore intervals, chords, modes and progressions.",
        "Comprendre ce que tu joues": "Understand what you play",
        "Construire une gamme": "Building a scale",
        "Comprendre les degrés": "Understanding scale degrees",
        "Empiler des tierces": "Stacking thirds",
        "Changer la disposition d’un accord": "Changing a chord voicing",
        "Les accords de chaque mode": "The chords in each mode",
        "Les accords que chaque mode engendre": "The chords each mode produces",
        "Trouver les accords de n’importe quel mode": "Finding the chords of any mode",
        "Une gamme, sept centres de gravité": "One scale, seven tonal centres",
        "Modes majeurs": "Major modes",
        "Modes mineurs": "Minor modes",
        "Modes grecs": "Greek Modes",
        "Modes mineurs harmoniques": "Harmonic Minor Modes",
        "Modes mineurs mélodiques": "Melodic Minor Modes",
        "Modes grecs et mineur naturel": "Greek Modes and Natural Minor",
        "Majeur/Ionien": "Major / Ionian",
        "Mineur/Aeolien": "Minor / Aeolian",
        "Comparer un mode parallèle": "Comparing a parallel mode",
        "Changer de couleur sans changer de tonique": "Changing colour without changing the tonic",
        "Des modes parallèles à Do majeur": "Modes parallel to C major",
        "Deux autres couleurs du mineur": "Two more minor colours",
        "Le mineur parallèle": "The parallel minor",
        "Voir la différence avec le mode relatif": "Seeing the difference from the relative mode",
        "Échanges modaux": "Modal interchange",
        "Emprunter un accord en trois étapes": "Borrowing a chord in three steps",
        "Ce n’est pas une modulation": "This is not modulation",
        "Construire une grille": "Building a progression",
        "Quatre progressions, quatre couleurs": "Four progressions, four colours",
        "Caractéristiques modales": "Modal characteristics",
        "Trouver la couleur du mode": "Finding a mode's colour",
        "Donner une fonction à chaque accord": "Giving each chord a function",
        "Lire les symboles d’accord": "Reading chord symbols",
        "La tonique reste Do": "The tonic remains C",
        "La tension du ♭II": "The tension of ♭II",
        "Ramène l’accord à la maison": "Bring the chord home",
        "Exemple en Do majeur": "Example in C major",
        "Exemple sur le degré I": "Example on degree I",
        "La référence": "The reference",
        "Une note sur deux": "Every other note",
        "Une ouverture lumineuse": "A bright opening",
        "Les fonctions essentielles": "Essential functions",
        "Les mots essentiels de la théorie musicale": "Essential music-theory terms",
        "Notes gammes et tonalité": "Notes, scales and keys",
        "La structure d’une œuvre": "The structure of a work",
        "La structure pop et rock": "Pop and rock song structure",
        "La nuance et l’expression": "Dynamics and expression",
        "L’articulation et le jeu": "Articulation and playing",
        "Écriture et notation": "Writing and notation",
        "La voix et le chant": "Voice and singing",
        "L’harmonie jazz et les musiques actuelles": "Jazz harmony and contemporary music",
        "Le rap et le hip-hop": "Rap and hip-hop",
        "Production, électronique et effets": "Production, electronic music and effects",
        "L’écosystème live et la performance": "Live performance and its ecosystem",
        "Les effets acoustiques et ornements": "Acoustic effects and ornaments",
        "Les formes musicales": "Musical forms",
        "Les textures musicales": "Musical textures",
        "Famille majeure · référence : Ionien": "Major family · reference: Ionian",
        "Famille mineure · référence : Éolien": "Minor family · reference: Aeolian",
        "Famille mineure harmonique · référence : Mineur harmonique": "Harmonic-minor family · reference: Harmonic minor",
        "Famille mineure mélodique · référence : Mineur mélodique": "Melodic-minor family · reference: Melodic minor",
        "Ionien": "Ionian",
        "Éolien": "Aeolian",
        "Lydien": "Lydian",
        "Mixolydien": "Mixolydian",
        "Phrygien": "Phrygian",
        "Locrien": "Locrian",
        "Mineur harmonique": "Harmonic minor",
        "Mineur mélodique": "Melodic minor",
        "Altéré": "Altered",
        "Note de départ": "Starting note",
        "Intervalle": "Interval",
        "CHAPITRE II": "CHAPTER II",
        "CHAPITRE III": "CHAPTER III",
        "CHAPITRE IV": "CHAPTER IV",
        "CHAPITRE V": "CHAPTER V",
        "CHAPITRE VI": "CHAPTER VI",
        "CHAPITRE VII": "CHAPTER VII",
        "HARMONIE": "HARMONY",
        "Comprendre ce que l'on joue": "Understand what you play",
        "LES ACCORDS": "CHORDS",
        "LES GAMMES": "SCALES",
        "LES MODES": "MODES",
        "LES TONALITÉS": "KEYS",
        "LE GLOSSAIRE": "GLOSSARY",
        "Unisson": "Unison",
        "Seconde mineure": "Minor second",
        "Seconde majeure": "Major second",
        "Tierce mineure": "Minor third",
        "Tierce majeure": "Major third",
        "Quarte juste": "Perfect fourth",
        "Quarte augmentée": "Augmented fourth",
        "Triton": "Tritone",
        "Quinte juste": "Perfect fifth",
        "Sixte mineure": "Minor sixth",
        "Sixte majeure": "Major sixth",
        "Septième mineure": "Minor seventh",
        "Septième majeure": "Major seventh",
        "Octave": "Octave",
        "unisson": "unison",
        "seconde mineure": "minor second",
        "seconde majeure": "major second",
        "tierce mineure": "minor third",
        "tierce majeure": "major third",
        "quarte juste": "perfect fourth",
        "quarte augmentée": "augmented fourth",
        "quinte juste": "perfect fifth",
        "sixte mineure": "minor sixth",
        "sixte majeure": "major sixth",
        "septième mineure": "minor seventh",
        "septième majeure": "major seventh",
        "octave": "octave",
        "Diatonique": "Diatonic",
        "Chromatique": "Chromatic",
        "Cordes": "Strings",
        "Corde": "String",
        "Corde 1": "String 1",
        "Corde 2": "String 2",
        "Corde 3": "String 3",
        "Corde 4": "String 4",
        "Corde 5": "String 5",
        "Corde 6": "String 6",
        "Sens du motif": "Pattern direction",
        "Ascendant": "Ascending",
        "Descendant": "Descending",
        "Mixte": "Mixed",
        "Écouter": "Listen",
        "Ajouter": "Add",
        "Réinitialiser": "Reset",
        "Copier le lien": "Copy link",
        "Créer un lien élève": "Create student link",
        "Le lien apparaîtra ici.": "The link will appear here.",
        "Afficher ou masquer les réglages": "Show or hide settings",
        "Passer le site en anglais": "Switch the site to English"
    };
    const attributeMap = {
        "Afficher ou masquer les réglages": "Show or hide settings",
        "Passer le site en anglais": "Switch the site to English",
        "Note de départ": "Starting note",
        "Intervalle": "Interval"
    };
    const originalText = new WeakMap();
    let translatorPromise;

    function protectChordSymbols(){
            document.querySelectorAll("#qualitySettings, .chord-display, .degree, .formula, .degree-row, .mode-chord, .exchange-progression, .chord-stacks-table, .progression-builder, .progression-presets, .progression-suggestions, .progression-diatonic-chords").forEach((element) => {
            element.setAttribute("translate", "no");
        });
    }

    function getTextNodes(){
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node){
                if(!node.nodeValue.trim() || node.parentElement?.closest("script, style, [translate='no'], .brand h1, footer")) return NodeFilter.FILTER_REJECT;
                if(/^[A-G](?:[♯♭#b]{1,2})?$/.test(node.nodeValue.trim())) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while(walker.nextNode()) nodes.push(walker.currentNode);
        return nodes;
    }

    function replaceText(node, text){
        const leading = node.nodeValue.match(/^\s*/)?.[0] || "";
        const trailing = node.nodeValue.match(/\s*$/)?.[0] || "";
        node.nodeValue = leading + text + trailing;
    }

    function preserveCapitalization(source, translation){
        if(source === source.toUpperCase()) return translation.toUpperCase();
        if(source[0] === source[0].toUpperCase()) return translation.charAt(0).toUpperCase() + translation.slice(1);
        return translation;
    }

    async function getTranslator(){
        if(!window.Translator) return null;
        translatorPromise ||= window.Translator.create({ sourceLanguage: "fr", targetLanguage: "en" }).catch(() => null);
        return translatorPromise;
    }

    async function translateRemaining(nodes){
        const translator = await getTranslator();
        if(!translator) return;
        await Promise.all(nodes.map(async (node) => {
            const source = originalText.get(node);
            if(!source || frToEn[source]) return;
            try {
                replaceText(node, preserveCapitalization(source, await translator.translate(source)));
            } catch (_) {
                // The curated translations above remain available when the browser translation model is unavailable.
            }
        }));
    }

    function translateAttributes(language){
        document.querySelectorAll("[aria-label], [title], [placeholder], [label]").forEach((element) => {
            ["aria-label", "title", "placeholder", "label"].forEach((name) => {
                const current = element.getAttribute(name);
                if(!current) return;
                const original = element.dataset[`i18n${name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`] || current;
                element.dataset[`i18n${name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`] = original;
                element.setAttribute(name, language === "en" ? (attributeMap[original] || original) : original);
            });
        });
    }

    function setLanguage(language){
        const english = language === "en";
        const nodes = getTextNodes();
        nodes.forEach((node) => {
            const source = originalText.get(node) || node.nodeValue.trim();
            originalText.set(node, source);
            replaceText(node, english ? preserveCapitalization(source, frToEn[source] || source) : source);
        });
        translateAttributes(language);
        document.documentElement.lang = language;
        const pageName = location.pathname.endsWith("notes.html") ? (english ? "Hear" : "Écoute")
            : location.pathname.endsWith("index.html") ? (english ? "Visualize" : "Observe")
            : new URLSearchParams(location.search).get("view") === "tools" ? (english ? "Tools" : "Outils")
            : (english ? "Understand" : "Comprend");
        document.title = `NØrivΔ — ${pageName}`;
        document.querySelectorAll(".language-toggle").forEach((button) => {
            button.replaceChildren(Object.assign(document.createElement("span"), {
                className: `language-flag language-flag--${english ? "en" : "fr"}`,
                ariaHidden: "true"
            }));
            button.setAttribute("aria-label", english ? "Switch the site to French" : "Passer le site en anglais");
            button.title = english ? "Français" : "English";
            button.setAttribute("aria-pressed", String(english));
        });
        try { localStorage.setItem(storageKey, language); } catch (_) {}
        document.dispatchEvent(new Event("noryva-language-change"));
        if(english) translateRemaining(nodes);
    }

    const savedLanguage = (() => {
        try { return localStorage.getItem(storageKey); } catch (_) { return null; }
    })();
    protectChordSymbols();
    setLanguage(savedLanguage === "en" ? "en" : "fr");
    document.querySelectorAll(".language-toggle").forEach((button) => {
        button.addEventListener("click", () => setLanguage(document.documentElement.lang === "en" ? "fr" : "en"));
    });
})();
