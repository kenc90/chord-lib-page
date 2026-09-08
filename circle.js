// Circle of Fifths - Interactive music theory tool

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTES_DISPLAY = ['C', 'C#/Db', 'D', 'Eb/D#', 'E', 'F', 'F#/Gb', 'G', 'Ab/G#', 'A', 'Bb/A#', 'B'];

// Circle of fifths order (clockwise from C): C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F
const CIRCLE_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

// Mode definitions (intervals in semitones from root)
const MODES = [
    { name: 'Ionian (Major)', intervals: [0, 2, 4, 5, 7, 9, 11], mood: 'Bright, happy, triumphant, and resolved. The foundation of Western music — used in pop, classical, folk, and nearly every genre. Feels stable, uplifting, and complete.', examples: 'Let It Be (Beatles), No Woman No Cry (Bob Marley), Imagine (John Lennon)' },
    { name: 'Dorian',         intervals: [0, 2, 3, 5, 7, 9, 10], mood: 'Bittersweet, soulful, and jazzy. A minor mode with a bright twist from the raised 6th. Common in funk, jazz, rock, and soul music. Feels cool, groovy, and slightly mysterious.', examples: 'Scarborough Fair, Oye Como Va (Santana), Mad World (Gary Jules)' },
    { name: 'Phrygian',       intervals: [0, 1, 3, 5, 7, 8, 10], mood: 'Dark, exotic, tense, and Spanish-flavored. The flattened 2nd gives it a distinct Middle Eastern / Flamenco character. Used in metal, hip-hop, and film scores for tension and drama.', examples: 'Wherever I May Roam (Metallica), Misirlou (Dick Dale), Set the Controls (Pink Floyd)' },
    { name: 'Lydian',         intervals: [0, 2, 4, 6, 7, 9, 11], mood: 'Dreamy, floating, ethereal, and wonder-filled. The raised 4th creates a sense of magic and otherworldliness. Common in film scores (sci-fi, fantasy) and progressive rock.', examples: 'The Simpsons Theme, Man on the Moon (R.E.M.), Flying (Beatles)' },
    { name: 'Mixolydian',     intervals: [0, 2, 4, 5, 7, 9, 10], mood: 'Bluesy, rock-oriented, laid-back, and adventurous. A major mode with a flattened 7th that gives it a blues/rock edge. The go-to mode for classic rock, blues-rock, and jam bands.', examples: 'Norwegian Wood (Beatles), Sweet Home Alabama, Roygbiv (Boards of Canada)' },
    { name: 'Aeolian (Minor)',intervals: [0, 2, 3, 5, 7, 8, 10], mood: 'Sad, melancholic, dramatic, and introspective. The natural minor scale — the emotional counterpart to major. Used extensively in pop ballads, rock, classical, and virtually every genre for emotional depth.', examples: 'Stairway to Heaven (Led Zeppelin), Losing My Religion (R.E.M.), Hello (Adele)' },
    { name: 'Locrian',        intervals: [0, 1, 3, 5, 6, 8, 10], mood: 'Unsettled, dissonant, dark, and unstable. The most dissonant mode with a diminished tonic chord. Rarely used as a tonal center — mostly appears in passing or in extreme metal, avant-garde, and jazz fusion.', examples: 'Dust to Dust (Thundercat), sections of YYZ (Rush), experimental jazz passages' },
];

// Diatonic chord qualities for each mode (triads: major, minor, diminished)
const MODE_CHORD_TYPES = [
    // Ionian:    I  ii  iii IV  V   vi  vii°
    ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
    // Dorian:    i  ii  III IV  v   vi  VII
    ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj'],
    // Phrygian:  i  II  III iv  v°  VI  vii
    ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min'],
    // Lydian:    I  II  iii iv° V   vi  vii
    ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min'],
    // Mixolydian: I  ii  iii° IV  v   vi  VII
    ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj'],
    // Aeolian:   i  ii° III iv  v   VI  VII
    ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
    // Locrian:   i° II  iii iv  V   VI  vii
    ['dim', 'maj', 'min', 'min', 'maj', 'maj', 'min'],
];

const ROMAN_NUMERALS = [
    ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    ['i', 'ii', 'III', 'IV', 'v', 'vi', 'VII'],
    ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
    ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
    ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
    ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
];

const DEGREE_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

// Key descriptions — character and mood associated with each key
const KEY_DESCRIPTIONS = [
    { key: 'C',  mood: 'Pure, simple, innocent, and clear. No sharps or flats — the "white keys" key. Conveys openness and neutrality.', character: '🤍' },
    { key: 'C#', mood: 'Intense, passionate, and dramatic. A key full of tension and energy, often used for climactic moments.', character: '🔥' },
    { key: 'D',  mood: 'Bright, victorious, and triumphant. A brilliant key associated with celebration, fanfares, and joyful energy.', character: '🎺' },
    { key: 'Eb', mood: 'Warm, noble, heroic, and majestic. A rich, powerful key favored by Beethoven and used for grand, stately compositions.', character: '👑' },
    { key: 'E',  mood: 'Lively, radiant, and full of energy. Bright and resonant on guitar due to open strings — one of the most guitar-friendly keys.', character: '☀️' },
    { key: 'F',  mood: 'Calm, pastoral, and contemplative. A gentle, warm key often associated with nature, peace, and quiet reflection.', character: '🌿' },
    { key: 'F#', mood: 'Mysterious, complex, and rich. A key that sits between brightness and darkness — used for nuanced, sophisticated compositions.', character: '✨' },
    { key: 'G',  mood: 'Friendly, warm, and earthy. The quintessential guitar key — open, resonant, and perfect for folk, country, and campfire songs.', character: '🎸' },
    { key: 'Ab', mood: 'Solemn, dreamy, and ethereal. A lush key with a velvety warmth, often used for romantic and deeply expressive pieces.', character: '🌙' },
    { key: 'A',  mood: 'Bold, confident, and spirited. A bright, assertive key popular in rock, pop, and classical — energetic and forward-driving.', character: '⚡' },
    { key: 'Bb', mood: 'Warm, dignified, and expressive. Common in jazz, brass band music, and soulful ballads — rich and full-bodied.', character: '🎷' },
    { key: 'B',  mood: 'Brilliant, sharp, and piercing. A key with a cutting clarity and intensity — bold and colorful with restless energy.', character: '💎' },
];

// Famous songs by key (index matches NOTES array order)
// Used for Ionian (major) and Aeolian (minor) mode examples
const KEY_SONGS = {
    major: [
        ['Let It Be (The Beatles)', 'Imagine (John Lennon)', 'Piano Man (Billy Joel)'],                                  // C
        ['Clair de Lune (Debussy)', 'Minute Waltz (Chopin)', 'Eternal Flame (The Bangles)'],                            // C#/Db
        ['Sweet Home Alabama (Lynyrd Skynyrd)', 'Free Fallin\' (Tom Petty)', 'Ode to Joy (Beethoven)'],                  // D
        ['Clocks (Coldplay)', 'Photograph (Ed Sheeran)', 'Emperor Concerto (Beethoven)'],                                 // Eb
        ['Don\'t Stop Believin\' (Journey)', 'Day Tripper (The Beatles)', 'Spring from Four Seasons (Vivaldi)'],         // E
        ['Yesterday (The Beatles)', 'Hey Jude (The Beatles)', 'The Scientist (Coldplay)'],                                // F
        ['I Wanna Dance with Somebody (Whitney Houston)', 'Barcarolle (Chopin)', 'Faith (George Michael)'],                // F#/Gb
        ['Brown Eyed Girl (Van Morrison)', 'Wish You Were Here (Pink Floyd)', 'Knockin\' on Heaven\'s Door (Bob Dylan)'], // G
        ['All of Me (John Legend)', 'Let It Go (Frozen)', 'Pathétique Sonata 2nd Mvt (Beethoven)'],                       // Ab
        ['Someone Like You (Adele)', 'Dancing Queen (ABBA)', 'Take On Me (a-ha)'],                                       // A
        ['Ave Maria (Schubert)', 'Hey Soul Sister (Train)', 'I Want It That Way (Backstreet Boys)'],                      // Bb
        ['Iris (Goo Goo Dolls)', 'Don\'t Know Why (Norah Jones)', 'Total Eclipse of the Heart (Bonnie Tyler)'],          // B
    ],
    minor: [
        ['Stairway to Heaven (Led Zeppelin)', 'Hurt (Johnny Cash)', 'Losing My Religion (R.E.M.)'],                      // Am
        ['Piano Concerto No. 1 (Tchaikovsky)', 'Nocturne Op. 9 No. 1 (Chopin)', 'Funeral March (Chopin)'],               // Bbm
        ['Hotel California (Eagles)', 'Money (Pink Floyd)', 'Mass in B Minor (Bach)'],                                    // Bm
        ['Rolling in the Deep (Adele)', 'Sweet Dreams (Eurythmics)', 'This Love (Maroon 5)'],                             // Cm
        ['Moonlight Sonata (Beethoven)', 'Prelude in C# Minor (Rachmaninoff)', 'Thriller (Michael Jackson)'],              // C#m
        ['Toccata and Fugue (Bach)', 'Careless Whisper (George Michael)', 'Requiem (Mozart)'],                            // Dm
        ['Superstition (Stevie Wonder)', 'The Sound of Silence (Simon & Garfunkel)', 'Etude Op. 10 No. 6 (Chopin)'],      // Ebm
        ['Nothing Else Matters (Metallica)', 'Eleanor Rigby (The Beatles)', 'Livin\' on a Prayer (Bon Jovi)'],            // Em
        ['Smells Like Teen Spirit (Nirvana)', 'Ballade No. 4 (Chopin)', 'Fantaisie in F Minor (Chopin)'],                 // Fm
        ['Billie Jean (Michael Jackson)', 'Lucid Dreams (Juice WRLD)', 'Farewell Symphony (Haydn)'],                      // F#m
        ['Symphony No. 40 (Mozart)', 'Bad Guy (Billie Eilish)', 'Havana (Camila Cabello)'],                               // Gm
        ['La Campanella (Liszt)', 'Prelude Op. 32 No. 12 (Rachmaninoff)', 'Starboy (The Weeknd)'],                        // G#m
    ],
};

// Chord shape lookup for modal display (common open/barre shapes)
const CHORD_SHAPES = {
    'C':    { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    'D':    { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    'E':    { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    'F':    { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
    'G':    { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    'A':    { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    'B':    { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    'Bb':   { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, from: 5, to: 1 } },
    'Eb':   { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
    'Ab':   { frets: [4, 3, 1, 1, 1, 4], fingers: [3, 2, 1, 1, 1, 4], barre: { fret: 1, from: 4, to: 2 } },
    'C#':   { frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], barre: { fret: 1, from: 3, to: 1 } },
    'F#':   { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 2, from: 6, to: 1 } },
    'Am':   { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    'Em':   { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    'Dm':   { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    'Bm':   { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 5, to: 1 } },
    'Cm':   { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 5, to: 1 } },
    'Fm':   { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
    'Gm':   { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 6, to: 1 } },
    'Ebm':  { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2] },
    'Abm':  { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 4, from: 6, to: 1 } },
    'Bbm':  { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, from: 5, to: 1 } },
    'C#m':  { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, from: 5, to: 1 } },
    'F#m':  { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, from: 6, to: 1 } },
    'Adim': { frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0] },
    'Bdim': { frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0] },
    'Edim': { frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0] },
    'F#dim':{ frets: [2, 3, 4, 2, 4, 2], fingers: [1, 2, 3, 1, 4, 1], barre: { fret: 2, from: 6, to: 1 } },
    'C#dim':{ frets: [-1, -1, 1, 2, 4, 2], fingers: [0, 0, 1, 2, 4, 3] },
    'G#dim':{ frets: [4, 5, 6, 4, 6, 4], fingers: [1, 2, 3, 1, 4, 1], barre: { fret: 4, from: 6, to: 1 } },
    'Abdim':{ frets: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 2, 1, 3] },
    'Ddim': { frets: [-1, -1, 0, 1, 3, 1], fingers: [0, 0, 0, 1, 3, 2] },
    'Ebdim':{ frets: [-1, -1, 1, 2, 0, 2], fingers: [0, 0, 1, 2, 0, 3] },
    'Gdim': { frets: [3, 4, 5, 3, 5, 3], fingers: [1, 2, 3, 1, 4, 1], barre: { fret: 3, from: 6, to: 1 } },
    'Fdim': { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barre: { fret: 1, from: 6, to: 1 } },
    'Bbdim':{ frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0] },
};

// Render a chord diagram SVG (for modal)
function renderChordShape(chord, label) {
    const width = 120, height = 150;
    const padding = { top: 25, bottom: 10, left: 20, right: 10 };
    const numStrings = 6, numFrets = 5;
    const fretboardWidth = width - padding.left - padding.right;
    const fretboardHeight = height - padding.top - padding.bottom;
    const stringSpacing = fretboardWidth / (numStrings - 1);
    const fretSpacing = fretboardHeight / numFrets;
    const frets = chord.frets;
    const playedFrets = frets.filter(f => f > 0);
    const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 1;
    const maxFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 5;
    let baseFret = chord.baseFret || 1;
    let displayOffset = 0;
    if (maxFret > 5) { baseFret = minFret; displayOffset = minFret - 1; }
    const showNut = baseFret <= 1 && displayOffset === 0;

    let svg = `<svg class="chord-diagram" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    if (showNut) {
        svg += `<line class="nut" x1="${padding.left}" y1="${padding.top}" x2="${padding.left + fretboardWidth}" y2="${padding.top}"/>`;
    } else {
        svg += `<text class="fret-number" x="2" y="${padding.top + fretSpacing / 2 + 3}">${baseFret}</text>`;
    }
    for (let i = 0; i <= numFrets; i++) {
        const y = padding.top + i * fretSpacing;
        const cls = (i === 0 && showNut) ? 'nut' : 'fret';
        if (i > 0 || !showNut) svg += `<line class="${cls}" x1="${padding.left}" y1="${y}" x2="${padding.left + fretboardWidth}" y2="${y}"/>`;
    }
    for (let i = 0; i < numStrings; i++) {
        const x = padding.left + i * stringSpacing;
        svg += `<line class="string" x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + fretboardHeight}"/>`;
    }
    for (let i = 0; i < numStrings; i++) {
        const fret = frets[i];
        const x = padding.left + i * stringSpacing;
        if (fret === -1) {
            const y = padding.top - 10;
            svg += `<line class="muted-string" x1="${x - 4}" y1="${y - 4}" x2="${x + 4}" y2="${y + 4}"/>`;
            svg += `<line class="muted-string" x1="${x - 4}" y1="${y + 4}" x2="${x + 4}" y2="${y - 4}"/>`;
        } else if (fret === 0) {
            const y = padding.top - 10;
            svg += `<circle class="open-string" cx="${x}" cy="${y}" r="4"/>`;
        } else {
            const adjustedFret = fret - displayOffset;
            const y = padding.top + (adjustedFret - 0.5) * fretSpacing;
            svg += `<circle class="finger" cx="${x}" cy="${y}" r="7"/>`;
            if (chord.fingers && chord.fingers[i] > 0) {
                svg += `<text class="finger-text" x="${x}" y="${y}">${chord.fingers[i]}</text>`;
            }
        }
    }
    if (chord.barre) {
        const barreFret = chord.barre.fret - displayOffset;
        const fromString = chord.barre.from;
        const toString = chord.barre.to;
        const y = padding.top + (barreFret - 0.5) * fretSpacing;
        const x1 = padding.left + (numStrings - fromString) * stringSpacing;
        const x2 = padding.left + (numStrings - toString) * stringSpacing;
        svg += `<rect class="barre" x="${Math.min(x1, x2)}" y="${y - 7}" width="${Math.abs(x2 - x1)}" height="14" rx="7"/>`;
    }
    svg += '</svg>';
    return svg;
}

// State
let currentKey = 0;
let currentMode = 0;

// Get scale notes for a key and mode
function getScaleNotes(key, mode) {
    return MODES[mode].intervals.map(interval => (key + interval) % 12);
}

// Render the circle of fifths SVG
function renderCircle() {
    const svg = document.getElementById('circle-svg');
    const cx = 300, cy = 300;
    const outerR = 250, innerR = 190, centerR = 130;

    let html = '';

    // Draw concentric circle guides
    html += `<circle class="circle-outer-ring" cx="${cx}" cy="${cy}" r="${outerR}"/>`;
    html += `<circle class="circle-inner-ring" cx="${cx}" cy="${cy}" r="${innerR}"/>`;
    html += `<circle class="circle-inner-ring" cx="${cx}" cy="${cy}" r="${centerR}"/>`;

    // Get scale notes for current selection
    const scaleNotes = getScaleNotes(currentKey, currentMode);

    // Draw 12 segments
    for (let i = 0; i < 12; i++) {
        const noteIndex = CIRCLE_ORDER[i];
        const angle = (i * 30 - 90) * Math.PI / 180; // -90 to start at top (12 o'clock)
        const nextAngle = ((i + 1) * 30 - 90) * Math.PI / 180;

        const isActive = noteIndex === currentKey;
        const isScaleNote = scaleNotes.includes(noteIndex);

        // Segment path (outer ring)
        const x1 = cx + outerR * Math.cos(angle);
        const y1 = cy + outerR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(nextAngle);
        const y2 = cy + outerR * Math.sin(nextAngle);
        const x3 = cx + innerR * Math.cos(nextAngle);
        const y3 = cy + innerR * Math.sin(nextAngle);
        const x4 = cx + innerR * Math.cos(angle);
        const y4 = cy + innerR * Math.sin(angle);

        let classes = 'circle-segment';
        if (isActive) classes += ' active';
        if (isScaleNote) classes += ' scale-note';

        html += `<path class="${classes}" d="M${x1},${y1} A${outerR},${outerR} 0 0,1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 0,0 ${x4},${y4} Z" data-note="${noteIndex}"/>`;

        // Divider line from center to outer
        html += `<line class="circle-line" x1="${cx + centerR * Math.cos(angle)}" y1="${cy + centerR * Math.sin(angle)}" x2="${cx + outerR * Math.cos(angle)}" y2="${cy + outerR * Math.sin(angle)}"/>`;

        // Note label (middle of segment, between inner and outer rings)
        const midR = (outerR + innerR) / 2;
        const midAngle = angle + (15 * Math.PI / 180);
        const textX = cx + midR * Math.cos(midAngle);
        const textY = cy + midR * Math.sin(midAngle);

        let textClasses = 'circle-note-text';
        if (isActive) textClasses += ' active';
        if (isScaleNote && !isActive) textClasses += ' scale-note';

        html += `<text class="${textClasses}" x="${textX}" y="${textY}">${NOTES[noteIndex]}</text>`;

        // Inner ring: diatonic chord for scale notes
        if (isScaleNote) {
            const scaleDegreeIndex = scaleNotes.indexOf(noteIndex);
            const chordType = MODE_CHORD_TYPES[currentMode][scaleDegreeIndex];
            const roman = ROMAN_NUMERALS[currentMode][scaleDegreeIndex];

            const chordR = (innerR + centerR) / 2;
            const chordX = cx + chordR * Math.cos(midAngle);
            const chordY = cy + chordR * Math.sin(midAngle);

            let chordClasses = 'circle-chord-text';
            if (isActive) chordClasses += ' active';
            if (isScaleNote && !isActive) chordClasses += ' scale-note';

            html += `<text class="${chordClasses}" x="${chordX}" y="${chordY}">${roman}</text>`;
        }
    }

    // Center text
    html += `<text class="circle-center-text" x="${cx}" y="${cy - 10}">${NOTES[currentKey]}</text>`;
    html += `<text class="circle-center-sub" x="${cx}" y="${cy + 15}">${MODES[currentMode].name.split(' ')[0]}</text>`;

    svg.innerHTML = html;

    // Add click handlers to segments
    svg.querySelectorAll('.circle-segment').forEach(segment => {
        segment.addEventListener('click', () => {
            const noteIndex = parseInt(segment.dataset.note);
            currentKey = noteIndex;
            // Update key button active state
            document.querySelectorAll('.key-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.querySelector(`.key-btn[data-key="${noteIndex}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            updateAll();
        });
    });
}

// Render scale notes
function renderScaleNotes() {
    const titleEl = document.getElementById('scale-title');
    const notesEl = document.getElementById('scale-notes');
    const keyMoodEl = document.getElementById('key-mood');
    const modeMoodEl = document.getElementById('mode-mood');
    const examplesEl = document.getElementById('song-examples');

    const keyInfo = KEY_DESCRIPTIONS[currentKey];
    const modeInfo = MODES[currentMode];

    titleEl.innerHTML = `<span class="key-name">${NOTES[currentKey]}</span> ${modeInfo.name}`;

    // Key mood
    keyMoodEl.innerHTML = `
        <div class="mood-item">
            <span class="mood-character">${keyInfo.character}</span>
            <span class="mood-text"><strong>${NOTES[currentKey]} Key:</strong> ${keyInfo.mood}</span>
        </div>
    `;

    // Mode mood
    modeMoodEl.innerHTML = `
        <div class="mood-item">
            <span class="mood-character">🎵</span>
            <span class="mood-text"><strong>${modeInfo.name}:</strong> ${modeInfo.mood}</span>
        </div>
    `;

    // Song examples - key-dependent for Ionian/Aeolian, mode classics otherwise
    let songList, songLabel;
    if (currentMode === 0) {
        songList = KEY_SONGS.major[currentKey];
        songLabel = `Songs in ${NOTES[currentKey]} Major`;
    } else if (currentMode === 5) {
        songList = KEY_SONGS.minor[currentKey];
        songLabel = `Songs in ${NOTES[currentKey]} Minor`;
    } else {
        songList = modeInfo.examples.split(',').map(s => s.trim());
        songLabel = `Classic ${modeInfo.name} Songs`;
    }
    const songLinks = songList.map(song => {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`;
        return `<a href="${url}" target="_blank" rel="noopener" class="song-link">${song}</a>`;
    }).join(', ');
    examplesEl.innerHTML = `
        <div class="mood-item">
            <span class="mood-character">🎶</span>
            <span class="mood-text"><strong>${songLabel}:</strong> ${songLinks}</span>
        </div>
    `;

    const scaleNotes = getScaleNotes(currentKey, currentMode);
    notesEl.innerHTML = scaleNotes.map((note, i) => `
        <div class="scale-note-chip${i === 0 ? ' root' : ''}">
            ${NOTES[note]}
            <span class="degree">${DEGREE_NAMES[i]}</span>
        </div>
    `).join('');
}

// Render diatonic chords
function renderDiatonicChords() {
    const chordsEl = document.getElementById('diatonic-chords');
    const scaleNotes = getScaleNotes(currentKey, currentMode);
    const chordTypes = MODE_CHORD_TYPES[currentMode];
    const romans = ROMAN_NUMERALS[currentMode];

    const suffixMap = { 'maj': '', 'min': 'm', 'dim': 'dim' };

    chordsEl.innerHTML = scaleNotes.map((note, i) => {
        const type = chordTypes[i];
        const suffix = suffixMap[type];
        const chordName = NOTES[note] + suffix;
        let roleClass = '';
        if (i === 0) roleClass = ' tonic';
        if (i === 3) roleClass = ' subdominant';
        if (i === 4) roleClass = ' dominant';

        return `
            <div class="diatonic-chord${roleClass}" onclick="showChordModal('${chordName}')">
                <div class="chord-name">${chordName}</div>
                <div class="chord-degree">${romans[i]}</div>
                <div class="chord-type">${type === 'maj' ? 'Major' : type === 'min' ? 'Minor' : 'Diminished'}</div>
            </div>
        `;
    }).join('');
}

// Show chord modal
function showChordModal(chordName) {
    const modal = document.getElementById('chord-modal');
    const titleEl = document.getElementById('chord-modal-title');
    const bodyEl = document.getElementById('chord-modal-body');
    
    const chord = CHORD_SHAPES[chordName];
    if (!chord) {
        alert(`Chord shape for "${chordName}" is not available.`);
        return;
    }
    
    titleEl.textContent = chordName;
    bodyEl.innerHTML = `
        <div class="chord-shape-display">
            ${renderChordShape(chord, chordName)}
            <div class="chord-info">
                <div class="chord-frets">Frets: ${chord.frets.map((f, i) => f === -1 ? 'x' : f).join(' ')}</div>
                <div class="chord-fingers">Fingers: ${chord.fingers.map(f => f || '-').join(' ')}</div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close chord modal
function closeChordModal() {
    document.getElementById('chord-modal').classList.remove('active');
}

// Render key relationships
function renderRelationships() {
    const relEl = document.getElementById('relationships');
    const scaleNotes = getScaleNotes(currentKey, currentMode);

    // Relative minor/major
    const relativeMinorIndex = (currentKey + 9) % 12; // Minor 3rd down = relative minor for major
    const relativeMajorIndex = (currentKey + 3) % 12; // Minor 3rd up = relative major for minor

    // Dominant (5th above)
    const dominantIndex = (currentKey + 7) % 12;
    // Subdominant (4th above / 5th below)
    const subdominantIndex = (currentKey + 5) % 12;

    // Parallel minor/major
    const parallelKey = currentKey; // Same root, different mode

    const isMinorMode = currentMode === 5;

    let html = '';
    if (!isMinorMode) {
        html += `<div class="relationship-item"><span class="rel-label">Relative Minor:</span><span class="rel-value">${NOTES[relativeMinorIndex]}m</span></div>`;
    } else {
        html += `<div class="relationship-item"><span class="rel-label">Relative Major:</span><span class="rel-value">${NOTES[relativeMajorIndex]}</span></div>`;
    }
    html += `<div class="relationship-item"><span class="rel-label">Dominant (V):</span><span class="rel-value">${NOTES[dominantIndex]}</span></div>`;
    html += `<div class="relationship-item"><span class="rel-label">Subdominant (IV):</span><span class="rel-value">${NOTES[subdominantIndex]}</span></div>`;
    html += `<div class="relationship-item"><span class="rel-label">Parallel:</span><span class="rel-value">${NOTES[parallelKey]}${isMinorMode ? '' : 'm'}</span></div>`;
    html += `<div class="relationship-item"><span class="rel-label">Key Signature:</span><span class="rel-value">${getKeySignature(currentKey, currentMode)}</span></div>`;

    relEl.innerHTML = html;
}

// Get key signature description
function getKeySignature(key, mode) {
    // Calculate the equivalent major key (Ionian root)
    const modeOffsets = [0, 10, 8, 7, 5, 3, 1]; // Semitones from mode root to equivalent major root
    const majorKey = (key + modeOffsets[mode]) % 12;

    // Number of sharps/flats for each major key
    const sharpsFlats = {
        0: 'No sharps or flats',   // C
        7: '1 sharp (F#)',         // G
        2: '2 sharps (F#, C#)',    // D
        9: '3 sharps (F#, C#, G#)',// A
        4: '4 sharps',             // E
        11: '5 sharps',            // B
        6: '6 sharps',             // F#
        1: '7 sharps / 5 flats',   // C#/Db
        8: '4 flats',              // Ab
        3: '3 flats (Bb, Eb, Ab)', // Eb
        10: '2 flats (Bb, Eb)',    // Bb
        5: '1 flat (Bb)',          // F
    };

    return sharpsFlats[majorKey] || '';
}

// Update all displays
function updateAll() {
    renderCircle();
    renderScaleNotes();
    renderDiatonicChords();
    renderRelationships();
}

// Event listeners
document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.key-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentKey = parseInt(btn.dataset.key);
        updateAll();
    });
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = parseInt(btn.dataset.mode);
        updateAll();
    });
});

// Modal event listeners
document.getElementById('chord-modal').addEventListener('click', (e) => {
    if (e.target.id === 'chord-modal') {
        closeChordModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeChordModal();
    }
});

// Initial render
updateAll();
