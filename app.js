// Guitar Chords Library - Complete chord data and SVG rendering

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const PINNED_CHORDS_STORAGE_KEY = 'guitar-chords-library-pinned-chords';

function getPinnedChordNames() {
    try {
        return new Set(JSON.parse(localStorage.getItem(PINNED_CHORDS_STORAGE_KEY)) || []);
    } catch {
        return new Set();
    }
}

function savePinnedChordNames(pinnedChordNames) {
    localStorage.setItem(PINNED_CHORDS_STORAGE_KEY, JSON.stringify([...pinnedChordNames]));
}

// Chord data: [string6, string5, string4, string3, string2, string1]
// -1 = muted, 0 = open, 1+ = fret number
// fingers: [s6, s5, s4, s3, s2, s1] - 0=none, 1-4=finger number
// baseFret: starting fret for the diagram (default 1)

const CHORDS = {
    major: [
        { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
        { name: 'C#', frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], baseFret: 1, barre: { fret: 1, from: 3, to: 1 } },
        { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
        { name: 'Eb', frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
        { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
        { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
        { name: 'Ab', frets: [4, 3, 1, 1, 1, 4], fingers: [3, 2, 1, 1, 1, 4], barre: { fret: 1, from: 4, to: 2 } },
        { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
        { name: 'Bb', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    ],
    minor: [
        { name: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 3, from: 5, to: 1 } },
        { name: 'C#m', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 4, from: 5, to: 1 } },
        { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
        { name: 'Ebm', frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2] },
        { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
        { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barre: { fret: 3, from: 6, to: 1 } },
        { name: 'Abm', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barre: { fret: 4, from: 6, to: 1 } },
        { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
        { name: 'Bbm', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    ],
    seventh: [
        { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
        { name: 'C#7', frets: [-1, 4, 3, 4, 2, 1], fingers: [0, 3, 2, 4, 1, 0], barre: { fret: 1, from: 3, to: 1 } },
        { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
        { name: 'Eb7', frets: [-1, -1, 1, 3, 2, 3], fingers: [0, 0, 1, 3, 2, 4] },
        { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
        { name: 'F7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#7', frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
        { name: 'Ab7', frets: [4, 3, 4, 3, 4, 4], fingers: [2, 1, 3, 1, 4, 4], barre: { fret: 4, from: 6, to: 1 } },
        { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
        { name: 'Bb7', frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 2, 1, 3, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
    ],
    major7: [
        { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
        { name: 'C#maj7', frets: [-1, 4, 3, 5, 5, 4], fingers: [0, 1, 1, 3, 4, 2], barre: { fret: 3, from: 4, to: 2 } },
        { name: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
        { name: 'Ebmaj7', frets: [-1, -1, 1, 3, 3, 3], fingers: [0, 0, 1, 2, 3, 4] },
        { name: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
        { name: 'Fmaj7', frets: [1, 3, 2, 2, 1, 1], fingers: [1, 4, 2, 3, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#maj7', frets: [2, 4, 3, 3, 2, 2], fingers: [1, 4, 2, 3, 1, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
        { name: 'Abmaj7', frets: [4, 3, 5, 5, 4, 4], fingers: [2, 1, 3, 4, 1, 1], barre: { fret: 4, from: 5, to: 1 } },
        { name: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0] },
        { name: 'Bbmaj7', frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'Bmaj7', frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    ],
    minor7: [
        { name: 'Cm7', frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 3, from: 6, to: 1 } },
        { name: 'C#m7', frets: [-1, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 4, from: 6, to: 1 } },
        { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 3, 1, 2] },
        { name: 'Ebm7', frets: [-1, -1, 1, 3, 2, 2], fingers: [0, 0, 1, 4, 2, 3] },
        { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
        { name: 'Fm7', frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#m7', frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'Gm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], baseFret: 1, barre: { fret: 3, from: 6, to: 1 } },
        { name: 'Abm7', frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], baseFret: 1, barre: { fret: 4, from: 6, to: 1 } },
        { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
        { name: 'Bbm7', frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'Bm7', frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    ],
    diminished: [
        { name: 'Cdim', frets: [-1, 3, 4, 5, 4, -1], fingers: [0, 1, 2, 4, 3, 0] },
        { name: 'C#dim', frets: [-1, -1, 1, 2, 4, 2], fingers: [0, 0, 1, 2, 4, 3] },
        { name: 'Ddim', frets: [-1, -1, 0, 1, 3, 1], fingers: [0, 0, 0, 1, 3, 2] },
        { name: 'Ebdim', frets: [-1, -1, 1, 2, 0, 2], fingers: [0, 0, 1, 2, 0, 3] },
        { name: 'Edim', frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0] },
        { name: 'Fdim', frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#dim', frets: [2, 3, 4, 2, 4, 2], fingers: [1, 2, 3, 1, 4, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'Gdim', frets: [3, 4, 5, 3, 5, 3], fingers: [1, 2, 3, 1, 4, 1], baseFret: 1, barre: { fret: 3, from: 6, to: 1 } },
        { name: 'Abdim', frets: [-1, -1, 1, 2, 1, 2], fingers: [0, 0, 1, 2, 1, 3] },
        { name: 'Adim', frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0] },
        { name: 'Bbdim', frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0] },
        { name: 'Bdim', frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0], baseFret: 1 },
    ],
    augmented: [
        { name: 'Caug', frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
        { name: 'C#aug', frets: [-1, 4, 3, 2, 2, 1], fingers: [0, 4, 3, 1, 2, 1] },
        { name: 'Daug', frets: [-1, -1, 0, 3, 3, 2], fingers: [0, 0, 0, 2, 3, 1] },
        { name: 'Ebaug', frets: [-1, -1, 1, 0, 0, 3], fingers: [0, 0, 1, 0, 0, 4] },
        { name: 'Eaug', frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
        { name: 'Faug', frets: [1, 0, 3, 2, 2, 1], fingers: [1, 0, 4, 2, 3, 1] },
        { name: 'F#aug', frets: [2, 1, 4, 3, 3, 2], fingers: [2, 1, 4, 3, 3, 1] },
        { name: 'Gaug', frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4] },
        { name: 'Abaug', frets: [4, 3, 2, 1, 1, 0], fingers: [4, 3, 2, 1, 1, 0] },
        { name: 'Aaug', frets: [-1, 0, 3, 2, 2, 1], fingers: [0, 0, 4, 2, 3, 1] },
        { name: 'Bbaug', frets: [-1, 1, 4, 3, 3, 2], fingers: [0, 1, 4, 2, 3, 1] },
        { name: 'Baug', frets: [-1, 2, 1, 0, 0, 3], fingers: [0, 2, 1, 0, 0, 4] },
    ],
    sus2: [
        { name: 'Csus2', frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 3, 0, 0, 1, 4] },
        { name: 'C#sus2', frets: [-1, 4, 1, 1, 2, 4], fingers: [0, 4, 1, 1, 2, 4], barre: { fret: 1, from: 4, to: 3 } },
        { name: 'Dsus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
        { name: 'Ebsus2', frets: [-1, -1, 1, 3, 4, 1], fingers: [0, 0, 1, 3, 4, 1] },
        { name: 'Esus2', frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0] },
        { name: 'Fsus2', frets: [-1, -1, 3, 0, 1, 3], fingers: [0, 0, 3, 0, 1, 4] },
        { name: 'F#sus2', frets: [-1, -1, 4, 1, 2, 4], fingers: [0, 0, 4, 1, 2, 4] },
        { name: 'Gsus2', frets: [3, 0, 0, 2, 3, 3], fingers: [2, 0, 0, 1, 3, 4] },
        { name: 'Absus2', frets: [4, 1, 1, 3, 4, 4], fingers: [3, 1, 1, 2, 3, 4], barre: { fret: 1, from: 5, to: 4 } },
        { name: 'Asus2', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
        { name: 'Bbsus2', frets: [-1, 1, 3, 3, 1, 1], fingers: [0, 1, 3, 4, 1, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'Bsus2', frets: [-1, 2, 4, 4, 2, 2], fingers: [0, 1, 3, 4, 1, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    ],
    sus4: [
        { name: 'Csus4', frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
        { name: 'C#sus4', frets: [-1, 4, 4, 1, 2, 2], fingers: [0, 3, 4, 1, 2, 2], barre: { fret: 1, from: 3, to: 1 } },
        { name: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
        { name: 'Ebsus4', frets: [-1, -1, 1, 3, 4, 4], fingers: [0, 0, 1, 2, 3, 4] },
        { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
        { name: 'Fsus4', frets: [1, 3, 3, 3, 1, 1], fingers: [1, 2, 3, 4, 1, 1], barre: { fret: 1, from: 6, to: 1 } },
        { name: 'F#sus4', frets: [2, 4, 4, 4, 2, 2], fingers: [1, 2, 3, 4, 1, 1], baseFret: 1, barre: { fret: 2, from: 6, to: 1 } },
        { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
        { name: 'Absus4', frets: [4, 4, 1, 1, 2, 4], fingers: [3, 4, 1, 1, 2, 4], barre: { fret: 1, from: 4, to: 3 } },
        { name: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
        { name: 'Bbsus4', frets: [-1, 1, 3, 3, 4, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, from: 5, to: 1 } },
        { name: 'Bsus4', frets: [-1, 2, 4, 4, 5, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 } },
    ],
};

// Alternate voicings/shapes for chords (multiple shapes per chord)
const CHORD_VOICINGS = {
    // === MAJOR CHORDS ===
    'C': [
        { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], label: 'Open Position' },
        { name: 'C', frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 3, from: 5, to: 1 }, label: 'A-shape Barre (3rd fret)' },
        { name: 'C', frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], baseFret: 7, barre: { fret: 8, from: 6, to: 1 }, label: 'E-shape Barre (8th fret)' },
        { name: 'C', frets: [-1, -1, 5, 5, 5, 8], fingers: [0, 0, 1, 2, 3, 4], baseFret: 1, label: 'D-shape (5th fret)' },
    ],
    'C#': [
        { name: 'C#', frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], barre: { fret: 1, from: 3, to: 1 }, label: 'Open A-shape (4th fret)' },
        { name: 'C#', frets: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1], baseFret: 8, barre: { fret: 9, from: 6, to: 1 }, label: 'E-shape Barre (9th fret)' },
    ],
    'D': [
        { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], label: 'Open Position' },
        { name: 'D', frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 5, from: 5, to: 1 }, label: 'A-shape Barre (5th fret)' },
        { name: 'D', frets: [10, 12, 12, 11, 10, 10], fingers: [1, 3, 4, 2, 1, 1], baseFret: 9, barre: { fret: 10, from: 6, to: 1 }, label: 'E-shape Barre (10th fret)' },
        { name: 'D', frets: [-1, -1, 0, 7, 7, 5], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1, label: 'Inversion (7th fret)' },
    ],
    'Eb': [
        { name: 'Eb', frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], label: 'Open Position' },
        { name: 'Eb', frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 6, from: 5, to: 1 }, label: 'A-shape Barre (6th fret)' },
        { name: 'Eb', frets: [11, 13, 13, 12, 11, 11], fingers: [1, 3, 4, 2, 1, 1], baseFret: 10, barre: { fret: 11, from: 6, to: 1 }, label: 'E-shape Barre (11th fret)' },
    ],
    'E': [
        { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], label: 'Open Position' },
        { name: 'E', frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 7, from: 5, to: 1 }, label: 'A-shape Barre (7th fret)' },
        { name: 'E', frets: [12, 14, 14, 13, 12, 12], fingers: [1, 3, 4, 2, 1, 1], baseFret: 11, barre: { fret: 12, from: 6, to: 1 }, label: 'E-shape Barre (12th fret)' },
        { name: 'E', frets: [0, 2, 2, 4, 5, 4], fingers: [0, 1, 1, 2, 4, 3], baseFret: 1, label: 'Upper voicing (open bass)' },
    ],
    'F': [
        { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 }, label: 'E-shape Barre (1st fret)' },
        { name: 'F', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], label: 'Small Barre (1st fret)' },
        { name: 'F', frets: [-1, 8, 10, 10, 10, 8], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'A-shape Barre (8th fret)' },
        { name: 'F', frets: [-1, -1, 3, 5, 6, 5], fingers: [0, 0, 1, 3, 4, 2], baseFret: 1, label: 'D-shape (3rd fret)' },
    ],
    'F#': [
        { name: 'F#', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 2, from: 6, to: 1 }, label: 'E-shape Barre (2nd fret)' },
        { name: 'F#', frets: [-1, -1, 4, 3, 2, 2], fingers: [0, 0, 3, 2, 1, 1], label: 'Small Barre (2nd fret)' },
        { name: 'F#', frets: [-1, 9, 11, 11, 11, 9], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 9, from: 5, to: 1 }, label: 'A-shape Barre (9th fret)' },
    ],
    'G': [
        { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], label: 'Open Position (3 fingers)' },
        { name: 'G', frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], label: 'Open Position (4 fingers)' },
        { name: 'G', frets: [-1, 10, 12, 12, 12, 10], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 10, from: 5, to: 1 }, label: 'A-shape Barre (10th fret)' },
        { name: 'G', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], baseFret: 2, barre: { fret: 3, from: 6, to: 1 }, label: 'E-shape Barre (3rd fret)' },
    ],
    'Ab': [
        { name: 'Ab', frets: [4, 3, 1, 1, 1, 4], fingers: [3, 2, 1, 1, 1, 4], barre: { fret: 1, from: 4, to: 2 }, label: 'C-shape (4th fret)' },
        { name: 'Ab', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 3, barre: { fret: 4, from: 6, to: 1 }, label: 'E-shape Barre (4th fret)' },
        { name: 'Ab', frets: [-1, 11, 13, 13, 13, 11], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 11, from: 5, to: 1 }, label: 'A-shape Barre (11th fret)' },
    ],
    'A': [
        { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], label: 'Open Position' },
        { name: 'A', frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'E-shape Barre (5th fret)' },
        { name: 'A', frets: [-1, 12, 14, 14, 14, 12], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 12, from: 5, to: 1 }, label: 'A-shape Barre (12th fret)' },
        { name: 'A', frets: [-1, 0, 2, 2, 2, 5], fingers: [0, 0, 1, 2, 3, 4], label: 'A with high E (5th fret)' },
    ],
    'Bb': [
        { name: 'Bb', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, from: 5, to: 1 }, label: 'A-shape Barre (1st fret)' },
        { name: 'Bb', frets: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], baseFret: 5, barre: { fret: 6, from: 6, to: 1 }, label: 'E-shape Barre (6th fret)' },
        { name: 'Bb', frets: [-1, -1, 3, 3, 3, 6], fingers: [0, 0, 1, 2, 3, 4], label: 'D-shape (3rd fret)' },
    ],
    'B': [
        { name: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 5, to: 1 }, label: 'A-shape Barre (2nd fret)' },
        { name: 'B', frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], baseFret: 6, barre: { fret: 7, from: 6, to: 1 }, label: 'E-shape Barre (7th fret)' },
        { name: 'B', frets: [-1, -1, 4, 4, 4, 7], fingers: [0, 0, 1, 2, 3, 4], label: 'D-shape (4th fret)' },
    ],

    // === MINOR CHORDS ===
    'Cm': [
        { name: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 5, to: 1 }, label: 'Am-shape Barre (3rd fret)' },
        { name: 'Cm', frets: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1], baseFret: 7, barre: { fret: 8, from: 6, to: 1 }, label: 'Em-shape Barre (8th fret)' },
    ],
    'C#m': [
        { name: 'C#m', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, from: 5, to: 1 }, label: 'Am-shape Barre (4th fret)' },
        { name: 'C#m', frets: [9, 11, 11, 9, 9, 9], fingers: [1, 3, 4, 1, 1, 1], baseFret: 8, barre: { fret: 9, from: 6, to: 1 }, label: 'Em-shape Barre (9th fret)' },
    ],
    'Dm': [
        { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], label: 'Open Position' },
        { name: 'Dm', frets: [-1, 8, 10, 10, 10, 8], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'Am-shape Barre (8th fret)' },
        { name: 'Dm', frets: [10, 12, 12, 10, 10, 10], fingers: [1, 3, 4, 1, 1, 1], baseFret: 9, barre: { fret: 10, from: 6, to: 1 }, label: 'Em-shape Barre (10th fret)' },
        { name: 'Dm', frets: [-1, -1, 0, 5, 6, 5], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1, label: 'Inversion (5th fret)' },
    ],
    'Ebm': [
        { name: 'Ebm', frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], label: 'Open Position' },
        { name: 'Ebm', frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 6, from: 5, to: 1 }, label: 'Am-shape Barre (6th fret)' },
        { name: 'Ebm', frets: [11, 13, 13, 11, 11, 11], fingers: [1, 3, 4, 1, 1, 1], baseFret: 10, barre: { fret: 11, from: 6, to: 1 }, label: 'Em-shape Barre (11th fret)' },
    ],
    'Em': [
        { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], label: 'Open Position' },
        { name: 'Em', frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 7, from: 5, to: 1 }, label: 'Am-shape Barre (7th fret)' },
        { name: 'Em', frets: [12, 14, 14, 12, 12, 12], fingers: [1, 3, 4, 1, 1, 1], baseFret: 11, barre: { fret: 12, from: 6, to: 1 }, label: 'Em-shape Barre (12th fret)' },
        { name: 'Em', frets: [0, 2, 2, 0, 3, 3], fingers: [0, 1, 2, 0, 3, 4], label: 'Em with high notes' },
    ],
    'Fm': [
        { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 }, label: 'Em-shape Barre (1st fret)' },
        { name: 'Fm', frets: [-1, 8, 10, 10, 9, 8], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'Am-shape Barre (8th fret)' },
    ],
    'F#m': [
        { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, from: 6, to: 1 }, label: 'Em-shape Barre (2nd fret)' },
        { name: 'F#m', frets: [-1, 9, 11, 11, 10, 9], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 9, from: 5, to: 1 }, label: 'Am-shape Barre (9th fret)' },
    ],
    'Gm': [
        { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 6, to: 1 }, label: 'Em-shape Barre (3rd fret)' },
        { name: 'Gm', frets: [-1, 10, 12, 12, 11, 10], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 10, from: 5, to: 1 }, label: 'Am-shape Barre (10th fret)' },
    ],
    'Abm': [
        { name: 'Abm', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 4, from: 6, to: 1 }, label: 'Em-shape Barre (4th fret)' },
        { name: 'Abm', frets: [-1, 11, 13, 13, 12, 11], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 11, from: 5, to: 1 }, label: 'Am-shape Barre (11th fret)' },
    ],
    'Am': [
        { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], label: 'Open Position' },
        { name: 'Am', frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'Em-shape Barre (5th fret)' },
        { name: 'Am', frets: [-1, 12, 14, 14, 13, 12], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barre: { fret: 12, from: 5, to: 1 }, label: 'Am-shape Barre (12th fret)' },
        { name: 'Am', frets: [-1, 0, 2, 2, 1, 5], fingers: [0, 0, 2, 3, 1, 4], label: 'Am with high E (5th fret)' },
    ],
    'Bbm': [
        { name: 'Bbm', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, from: 5, to: 1 }, label: 'Am-shape Barre (1st fret)' },
        { name: 'Bbm', frets: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 1, 1, 1], baseFret: 5, barre: { fret: 6, from: 6, to: 1 }, label: 'Em-shape Barre (6th fret)' },
    ],
    'Bm': [
        { name: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 5, to: 1 }, label: 'Am-shape Barre (2nd fret)' },
        { name: 'Bm', frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1], baseFret: 6, barre: { fret: 7, from: 6, to: 1 }, label: 'Em-shape Barre (7th fret)' },
        { name: 'Bm', frets: [-1, -1, 4, 4, 3, 2], fingers: [0, 0, 3, 4, 2, 1], label: 'Small shape (4th fret)' },
    ],

    // === 7TH CHORDS ===
    'C7': [
        { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], label: 'Open Position' },
        { name: 'C7', frets: [8, 10, 8, 9, 8, 8], fingers: [1, 3, 1, 2, 1, 1], baseFret: 7, barre: { fret: 8, from: 6, to: 1 }, label: 'E7-shape Barre (8th fret)' },
        { name: 'C7', frets: [-1, 3, 5, 3, 5, 3], fingers: [0, 1, 3, 1, 4, 2], baseFret: 1, label: 'A7-shape (3rd fret)' },
    ],
    'D7': [
        { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], label: 'Open Position' },
        { name: 'D7', frets: [-1, 8, 10, 8, 10, 8], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'A7-shape Barre (8th fret)' },
        { name: 'D7', frets: [10, 12, 10, 11, 10, 10], fingers: [1, 3, 1, 2, 1, 1], baseFret: 9, barre: { fret: 10, from: 6, to: 1 }, label: 'E7-shape Barre (10th fret)' },
    ],
    'E7': [
        { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], label: 'Open Position' },
        { name: 'E7', frets: [0, 2, 2, 1, 3, 0], fingers: [0, 2, 3, 1, 4, 0], label: 'Open Position (alt)' },
        { name: 'E7', frets: [-1, 7, 9, 7, 8, 7], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 7, from: 5, to: 1 }, label: 'A7-shape Barre (7th fret)' },
        { name: 'E7', frets: [0, 2, 0, 4, 5, 4], fingers: [0, 1, 0, 2, 4, 3], label: 'Upper voicing (open bass)' },
    ],
    'F7': [
        { name: 'F7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 }, label: 'E7-shape Barre (1st fret)' },
        { name: 'F7', frets: [-1, 8, 10, 8, 10, 8], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'A7-shape Barre (8th fret)' },
    ],
    'F#7': [
        { name: 'F#7', frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 2, from: 6, to: 1 }, label: 'E7-shape Barre (2nd fret)' },
        { name: 'F#7', frets: [-1, 9, 11, 9, 11, 9], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 9, from: 5, to: 1 }, label: 'A7-shape Barre (9th fret)' },
    ],
    'G7': [
        { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], label: 'Open Position' },
        { name: 'G7', frets: [-1, 10, 12, 10, 12, 10], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 10, from: 5, to: 1 }, label: 'A7-shape Barre (10th fret)' },
        { name: 'G7', frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1], baseFret: 2, barre: { fret: 3, from: 6, to: 1 }, label: 'E7-shape Barre (3rd fret)' },
    ],
    'Ab7': [
        { name: 'Ab7', frets: [4, 3, 4, 3, 4, 4], fingers: [2, 1, 3, 1, 4, 4], barre: { fret: 4, from: 6, to: 1 }, label: 'E7-shape Barre (4th fret)' },
        { name: 'Ab7', frets: [-1, 11, 13, 11, 13, 11], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 11, from: 5, to: 1 }, label: 'A7-shape Barre (11th fret)' },
    ],
    'A7': [
        { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], label: 'Open Position' },
        { name: 'A7', frets: [5, 7, 5, 6, 5, 5], fingers: [1, 3, 1, 2, 1, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'E7-shape Barre (5th fret)' },
        { name: 'A7', frets: [-1, 12, 14, 12, 14, 12], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 12, from: 5, to: 1 }, label: 'A7-shape Barre (12th fret)' },
        { name: 'A7', frets: [-1, 0, 2, 2, 2, 3], fingers: [0, 0, 1, 2, 3, 4], label: 'A7 (alt fingering)' },
    ],
    'Bb7': [
        { name: 'Bb7', frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 2, 1, 3, 1], barre: { fret: 1, from: 5, to: 1 }, label: 'A7-shape Barre (1st fret)' },
        { name: 'Bb7', frets: [6, 8, 6, 7, 6, 6], fingers: [1, 3, 1, 2, 1, 1], baseFret: 5, barre: { fret: 6, from: 6, to: 1 }, label: 'E7-shape Barre (6th fret)' },
    ],
    'B7': [
        { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], label: 'Open Position' },
        { name: 'B7', frets: [-1, 2, 4, 2, 4, 2], fingers: [0, 1, 2, 1, 3, 1], baseFret: 1, barre: { fret: 2, from: 5, to: 1 }, label: 'A7-shape Barre (2nd fret)' },
        { name: 'B7', frets: [7, 9, 7, 8, 7, 7], fingers: [1, 3, 1, 2, 1, 1], baseFret: 6, barre: { fret: 7, from: 6, to: 1 }, label: 'E7-shape Barre (7th fret)' },
    ],

    // === MAJ7 CHORDS ===
    'Cmaj7': [
        { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], label: 'Open Position' },
        { name: 'Cmaj7', frets: [-1, 3, 5, 4, 5, 3], fingers: [0, 1, 3, 2, 4, 1], baseFret: 1, label: 'A-shape (3rd fret)' },
        { name: 'Cmaj7', frets: [8, 10, 9, 9, 8, 8], fingers: [1, 4, 2, 3, 1, 1], baseFret: 7, barre: { fret: 8, from: 6, to: 1 }, label: 'E-shape Barre (8th fret)' },
    ],
    'Dmaj7': [
        { name: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], label: 'Open Position' },
        { name: 'Dmaj7', frets: [-1, 5, 7, 6, 7, 5], fingers: [0, 1, 3, 2, 4, 1], baseFret: 1, label: 'A-shape (5th fret)' },
        { name: 'Dmaj7', frets: [10, 12, 11, 11, 10, 10], fingers: [1, 4, 2, 3, 1, 1], baseFret: 9, barre: { fret: 10, from: 6, to: 1 }, label: 'E-shape Barre (10th fret)' },
    ],
    'Emaj7': [
        { name: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], label: 'Open Position' },
        { name: 'Emaj7', frets: [0, 2, 4, 4, 4, 4], fingers: [0, 1, 2, 3, 4, 4], baseFret: 1, label: 'A-shape (open bass)' },
    ],
    'Fmaj7': [
        { name: 'Fmaj7', frets: [1, 3, 2, 2, 1, 1], fingers: [1, 4, 2, 3, 1, 1], barre: { fret: 1, from: 6, to: 1 }, label: 'E-shape Barre (1st fret)' },
        { name: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], label: 'Small shape (1st fret)' },
    ],
    'Gmaj7': [
        { name: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1], label: 'Open Position' },
        { name: 'Gmaj7', frets: [3, 5, 4, 4, 3, 3], fingers: [1, 4, 2, 3, 1, 1], baseFret: 2, barre: { fret: 3, from: 6, to: 1 }, label: 'E-shape Barre (3rd fret)' },
    ],
    'Amaj7': [
        { name: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0], label: 'Open Position' },
        { name: 'Amaj7', frets: [5, 7, 6, 6, 5, 5], fingers: [1, 4, 2, 3, 1, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'E-shape Barre (5th fret)' },
    ],
    'Bmaj7': [
        { name: 'Bmaj7', frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 2, from: 5, to: 1 }, label: 'A-shape Barre (2nd fret)' },
        { name: 'Bmaj7', frets: [7, 9, 8, 8, 7, 7], fingers: [1, 4, 2, 3, 1, 1], baseFret: 6, barre: { fret: 7, from: 6, to: 1 }, label: 'E-shape Barre (7th fret)' },
    ],

    // === MIN7 CHORDS ===
    'Cm7': [
        { name: 'Cm7', frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 3, from: 6, to: 1 }, label: 'Em7-shape Barre (3rd fret)' },
        { name: 'Cm7', frets: [8, 10, 8, 8, 8, 8], fingers: [1, 3, 1, 1, 1, 1], baseFret: 7, barre: { fret: 8, from: 6, to: 1 }, label: 'Am7-shape Barre (8th fret)' },
    ],
    'Dm7': [
        { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 3, 1, 2], label: 'Open Position' },
        { name: 'Dm7', frets: [-1, 8, 10, 8, 10, 8], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'Am7-shape Barre (8th fret)' },
        { name: 'Dm7', frets: [10, 12, 10, 10, 10, 10], fingers: [1, 3, 1, 1, 1, 1], baseFret: 9, barre: { fret: 10, from: 6, to: 1 }, label: 'Em7-shape Barre (10th fret)' },
    ],
    'Em7': [
        { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], label: 'Open Position' },
        { name: 'Em7', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 4, 0], label: 'Open Position (alt)' },
        { name: 'Em7', frets: [-1, 7, 9, 7, 8, 7], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 7, from: 5, to: 1 }, label: 'Am7-shape Barre (7th fret)' },
        { name: 'Em7', frets: [0, 2, 2, 4, 3, 3], fingers: [0, 1, 1, 3, 2, 2], baseFret: 1, label: 'Upper voicing (open bass)' },
    ],
    'Fm7': [
        { name: 'Fm7', frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 }, label: 'Em7-shape Barre (1st fret)' },
        { name: 'Fm7', frets: [-1, 8, 10, 8, 9, 8], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 8, from: 5, to: 1 }, label: 'Am7-shape Barre (8th fret)' },
    ],
    'Gm7': [
        { name: 'Gm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 3, from: 6, to: 1 }, label: 'Em7-shape Barre (3rd fret)' },
        { name: 'Gm7', frets: [-1, 10, 12, 10, 11, 10], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 10, from: 5, to: 1 }, label: 'Am7-shape Barre (10th fret)' },
    ],
    'Am7': [
        { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], label: 'Open Position' },
        { name: 'Am7', frets: [5, 7, 5, 5, 5, 5], fingers: [1, 3, 1, 1, 1, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'Em7-shape Barre (5th fret)' },
        { name: 'Am7', frets: [-1, 12, 14, 12, 13, 12], fingers: [0, 1, 3, 1, 2, 1], baseFret: 1, barre: { fret: 12, from: 5, to: 1 }, label: 'Am7-shape Barre (12th fret)' },
    ],
    'Bm7': [
        { name: 'Bm7', frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 2, from: 5, to: 1 }, label: 'Am7-shape Barre (2nd fret)' },
        { name: 'Bm7', frets: [7, 9, 7, 7, 7, 7], fingers: [1, 3, 1, 1, 1, 1], baseFret: 6, barre: { fret: 7, from: 6, to: 1 }, label: 'Em7-shape Barre (7th fret)' },
    ],

    // === SUS CHORDS ===
    'Asus2': [
        { name: 'Asus2', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], label: 'Open Position' },
        { name: 'Asus2', frets: [5, 7, 7, 7, 5, 5], fingers: [1, 2, 3, 4, 1, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'Esus2-shape Barre (5th fret)' },
    ],
    'Asus4': [
        { name: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], label: 'Open Position' },
        { name: 'Asus4', frets: [5, 7, 7, 7, 8, 5], fingers: [1, 2, 3, 4, 4, 1], baseFret: 4, barre: { fret: 5, from: 6, to: 1 }, label: 'Esus4-shape Barre (5th fret)' },
    ],
    'Dsus2': [
        { name: 'Dsus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], label: 'Open Position' },
        { name: 'Dsus2', frets: [-1, 5, 7, 7, 8, 5], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barre: { fret: 5, from: 5, to: 1 }, label: 'Asus2-shape Barre (5th fret)' },
    ],
    'Dsus4': [
        { name: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], label: 'Open Position' },
        { name: 'Dsus4', frets: [-1, 5, 7, 7, 8, 8], fingers: [0, 1, 2, 3, 4, 4], baseFret: 1, barre: { fret: 5, from: 5, to: 1 }, label: 'Asus4-shape Barre (5th fret)' },
    ],
    'Esus2': [
        { name: 'Esus2', frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0], label: 'Open Position' },
        { name: 'Esus2', frets: [0, 2, 2, 4, 0, 0], fingers: [0, 1, 2, 4, 0, 0], label: 'Simplified Open' },
    ],
    'Esus4': [
        { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0], label: 'Open Position' },
        { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], label: 'Open Position (alt fingers)' },
    ],
    'Gsus2': [
        { name: 'Gsus2', frets: [3, 0, 0, 2, 3, 3], fingers: [2, 0, 0, 1, 3, 4], label: 'Open Position' },
    ],
    'Gsus4': [
        { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], label: 'Open Position' },
        { name: 'Gsus4', frets: [3, 5, 5, 5, 3, 3], fingers: [1, 2, 3, 4, 1, 1], baseFret: 2, barre: { fret: 3, from: 6, to: 1 }, label: 'Esus4-shape Barre (3rd fret)' },
    ],
};

// SVG Chord Diagram Renderer
function renderChordDiagram(chord) {
    const width = 120;
    const height = 150;
    const padding = { top: 25, bottom: 10, left: 20, right: 10 };
    const numStrings = 6;
    const numFrets = 5;

    const fretboardWidth = width - padding.left - padding.right;
    const fretboardHeight = height - padding.top - padding.bottom;
    const stringSpacing = fretboardWidth / (numStrings - 1);
    const fretSpacing = fretboardHeight / numFrets;

    // Determine the base fret
    const frets = chord.frets;
    const playedFrets = frets.filter(f => f > 0);
    const minFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 1;
    const maxFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 5;

    let baseFret = chord.baseFret || 1;
    let displayOffset = 0;

    // If chord is above fret 5, shift the diagram
    if (maxFret > 5) {
        baseFret = minFret;
        displayOffset = minFret - 1;
    }

    // Determine if we show the nut
    const showNut = baseFret <= 1 && displayOffset === 0;

    let svg = `<svg class="chord-diagram" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Draw nut or fret number
    if (showNut) {
        svg += `<line class="nut" x1="${padding.left}" y1="${padding.top}" x2="${padding.left + fretboardWidth}" y2="${padding.top}"/>`;
    } else {
        svg += `<text class="fret-number" x="${2}" y="${padding.top + fretSpacing / 2 + 3}">${baseFret}</text>`;
    }

    // Draw frets (horizontal lines)
    for (let i = 0; i <= numFrets; i++) {
        const y = padding.top + i * fretSpacing;
        const cssClass = (i === 0 && showNut) ? 'nut' : 'fret';
        if (i > 0 || !showNut) {
            svg += `<line class="${cssClass}" x1="${padding.left}" y1="${y}" x2="${padding.left + fretboardWidth}" y2="${y}"/>`;
        }
    }

    // Draw strings (vertical lines)
    for (let i = 0; i < numStrings; i++) {
        const x = padding.left + i * stringSpacing;
        svg += `<line class="string" x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + fretboardHeight}"/>`;
    }

    // Draw finger positions, open/muted indicators
    for (let i = 0; i < numStrings; i++) {
        const stringIndex = numStrings - 1 - i; // reverse: string 0 = low E (left)
        const fret = frets[i];
        const x = padding.left + i * stringSpacing;

        if (fret === -1) {
            // Muted string - draw X
            const y = padding.top - 10;
            svg += `<line class="muted-string" x1="${x - 4}" y1="${y - 4}" x2="${x + 4}" y2="${y + 4}"/>`;
            svg += `<line class="muted-string" x1="${x - 4}" y1="${y + 4}" x2="${x + 4}" y2="${y - 4}"/>`;
        } else if (fret === 0) {
            // Open string - draw O
            const y = padding.top - 10;
            svg += `<circle class="open-string" cx="${x}" cy="${y}" r="4"/>`;
        } else {
            // Fingered note
            const adjustedFret = fret - displayOffset;
            const y = padding.top + (adjustedFret - 0.5) * fretSpacing;
            svg += `<circle class="finger" cx="${x}" cy="${y}" r="7"/>`;

            // Add finger number if available
            if (chord.fingers && chord.fingers[i] > 0) {
                svg += `<text class="finger-text" x="${x}" y="${y}">${chord.fingers[i]}</text>`;
            }
        }
    }

    // Draw barre if applicable
    if (chord.barre) {
        const barreFret = chord.barre.fret - displayOffset;
        const fromString = chord.barre.from;
        const toString = chord.barre.to;
        const y = padding.top + (barreFret - 0.5) * fretSpacing;
        const x1 = padding.left + (numStrings - fromString) * stringSpacing;
        const x2 = padding.left + (numStrings - toString) * stringSpacing;
        const barWidth = Math.abs(x2 - x1);
        const barX = Math.min(x1, x2);
        svg += `<rect class="barre" x="${barX}" y="${y - 7}" width="${barWidth}" height="14" rx="7"/>`;
    }

    svg += '</svg>';
    return svg;
}

// Render chord card
function renderChordCard(chord) {
    // Split chord name into note and suffix
    const match = chord.name.match(/^([A-G][#b]?)(.*)$/);
    const note = match ? match[1] : chord.name;
    const suffix = match ? match[2] : '';

    // Check if this chord has alternate voicings
    const hasVoicings = CHORD_VOICINGS[chord.name] && CHORD_VOICINGS[chord.name].length > 1;
    const clickAttr = hasVoicings ? `onclick="showChordVoicings('${chord.name}')"` : '';
    const hasMoreClass = hasVoicings ? ' has-voicings' : '';
    const isPinned = getPinnedChordNames().has(chord.name);

    return `
        <div class="chord-card${hasMoreClass}" ${clickAttr}>
            <button class="pin-chord-btn${isPinned ? ' pinned' : ''}" type="button" onclick="toggleChordPin(event, '${chord.name}')" aria-label="${isPinned ? 'Unpin' : 'Pin'} ${chord.name}" title="${isPinned ? 'Unpin' : 'Pin'} ${chord.name}">
                <svg class="pin-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5M8 3h8l-1 7 3 3H6l3-3-1-7Z"/></svg>
            </button>
            <div class="chord-name">
                <span class="note">${note}</span><span class="suffix">${suffix}</span>
            </div>
            ${renderChordDiagram(chord)}
            ${hasVoicings ? `<div class="voicings-hint">${t('clickMore')}</div>` : ''}
        </div>
    `;
}

function toggleChordPin(event, chordName) {
    event.stopPropagation();
    const pinnedChordNames = getPinnedChordNames();

    if (pinnedChordNames.has(chordName)) {
        pinnedChordNames.delete(chordName);
    } else {
        pinnedChordNames.add(chordName);
    }

    savePinnedChordNames(pinnedChordNames);
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    renderCategory(activeCategory);
}

// Render all chords for a category
function renderCategory(category) {
    const container = document.getElementById('chords-container');
    if (category === 'all') {
        const NOTE_ORDER = { 'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11 };
        const CATEGORY_ORDER = ['major', 'minor', 'seventh', 'major7', 'minor7', 'diminished', 'augmented', 'sus2', 'sus4'];

        const allChords = [];
        for (const [cat, chords] of Object.entries(CHORDS)) {
            chords.forEach(chord => {
                allChords.push({ chord, category: cat });
            });
        }

        allChords.sort((a, b) => {
            const noteA = a.chord.name.match(/^([A-G][#b]?)/)?.[1] || '';
            const noteB = b.chord.name.match(/^([A-G][#b]?)/)?.[1] || '';

            const rootIndexA = NOTE_ORDER[noteA] ?? 99;
            const rootIndexB = NOTE_ORDER[noteB] ?? 99;

            if (rootIndexA !== rootIndexB) return rootIndexA - rootIndexB;

            const catIndexA = CATEGORY_ORDER.indexOf(a.category);
            const catIndexB = CATEGORY_ORDER.indexOf(b.category);
            return (catIndexA === -1 ? 99 : catIndexA) - (catIndexB === -1 ? 99 : catIndexB);
        });

        // Group by note and render with section headers
        let html = '';
        let currentNote = '';
        for (const item of allChords) {
            const note = item.chord.name.match(/^([A-G][#b]?)/)?.[1] || '';
            if (note !== currentNote) {
                currentNote = note;
                html += `<div class="chord-section-header">${note}</div>`;
            }
            html += renderChordCard(item.chord);
        }
        container.innerHTML = html;
    } else if (category === 'pinned') {
        const pinnedChordNames = getPinnedChordNames();
        const pinnedChords = Object.values(CHORDS)
            .flat()
            .filter(chord => pinnedChordNames.has(chord.name));

        container.innerHTML = pinnedChords.length > 0
            ? pinnedChords.map(renderChordCard).join('')
            : `<p class="empty-pinned-chords">${t('noPinned')}</p>`;
    } else {
        const chords = CHORDS[category] || [];
        container.innerHTML = chords.map(renderChordCard).join('');
    }
}

// Show chord voicings modal
function showChordVoicings(chordName) {
    const voicings = CHORD_VOICINGS[chordName];
    if (!voicings || voicings.length === 0) return;

    const modal = document.getElementById('voicings-modal');
    const modalTitle = document.getElementById('modal-chord-name');
    const modalContent = document.getElementById('modal-voicings');

    // Set modal title
    const match = chordName.match(/^([A-G][#b]?)(.*)$/);
    const note = match ? match[1] : chordName;
    const suffix = match ? match[2] : '';
    modalTitle.innerHTML = `<span class="note">${note}</span><span class="suffix">${suffix}</span> - ${t('allShapes')}`;

    // Render all voicings
    modalContent.innerHTML = voicings.map(voicing => `
        <div class="voicing-card">
            <div class="voicing-label">${voicing.label}</div>
            ${renderChordDiagram(voicing)}
        </div>
    `).join('');

    // Show modal
    modal.classList.add('active');
}

// Close voicings modal
function closeVoicingsModal() {
    const modal = document.getElementById('voicings-modal');
    modal.classList.remove('active');
}

// Event listeners
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCategory(btn.dataset.category);
    });
});

document.addEventListener('languagechange', () => {
    renderCategory(document.querySelector('.category-btn.active').dataset.category);
});

// Close modal when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
    const modal = document.getElementById('voicings-modal');
    if (e.target === modal) {
        closeVoicingsModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVoicingsModal();
    }
});

// Scroll to top button visibility
const scrollToTopBtn = document.getElementById('scroll-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Initial render
renderCategory('major');
