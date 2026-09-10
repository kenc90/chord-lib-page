// Chord Identifier - Interactive fretboard and chord detection

// Chromatic scale (12 notes)
const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Standard guitar tuning (string 6 to string 1, low to high)
const TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

// Number of frets to display
const NUM_FRETS = 15;

// Fret positions with inlay markers (dots)
const INLAY_FRETS = [3, 5, 7, 9, 12, 15];

// Chord formulas: intervals in semitones from root
const CHORD_FORMULAS = {
    'Major':     { intervals: [0, 4, 7], suffix: '' },
    'Minor':     { intervals: [0, 3, 7], suffix: 'm' },
    'Diminished':{ intervals: [0, 3, 6], suffix: 'dim' },
    'Augmented': { intervals: [0, 4, 8], suffix: 'aug' },
    'Sus2':      { intervals: [0, 2, 7], suffix: 'sus2' },
    'Sus4':      { intervals: [0, 5, 7], suffix: 'sus4' },
    '7th':       { intervals: [0, 4, 7, 10], suffix: '7' },
    'Maj7':      { intervals: [0, 4, 7, 11], suffix: 'maj7' },
    'Min7':      { intervals: [0, 3, 7, 10], suffix: 'm7' },
    'MinMaj7':   { intervals: [0, 3, 7, 11], suffix: 'm(maj7)' },
    'Dim7':      { intervals: [0, 3, 6, 9], suffix: 'dim7' },
    'Half-dim7': { intervals: [0, 3, 6, 10], suffix: 'm7b5' },
    'Aug7':      { intervals: [0, 4, 8, 10], suffix: 'aug7' },
    'AugMaj7':   { intervals: [0, 4, 8, 11], suffix: 'aug(maj7)' },
    '6th':       { intervals: [0, 4, 7, 9], suffix: '6' },
    'Min6':      { intervals: [0, 3, 7, 9], suffix: 'm6' },
    '9th':       { intervals: [0, 4, 7, 10, 14], suffix: '9' },
    'Min9':      { intervals: [0, 3, 7, 10, 14], suffix: 'm9' },
    'Maj9':      { intervals: [0, 4, 7, 11, 14], suffix: 'maj9' },
    'Add9':      { intervals: [0, 4, 7, 14], suffix: 'add9' },
    '7sus4':     { intervals: [0, 5, 7, 10], suffix: '7sus4' },
    'Power':     { intervals: [0, 7], suffix: '5' },
};

// State
let selectedNotes = new Set(); // Store as "string-fret" keys
let notePositions = {}; // Map key -> note name
let savedNotes = null; // Temp storage for hover preview
let isPreviewing = false;
let pinnedChord = null; // Pinned chord { root, type }
let currentPreviewChord = null; // Currently previewed/hovered chord { root, type }

// Get note at a specific string and fret
function getNoteAtPosition(stringIndex, fret) {
    const openNote = TUNING[stringIndex];
    const openNoteIndex = NOTES.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    return NOTES[noteIndex];
}

// Render the fretboard
function renderFretboard() {
    const fretboard = document.getElementById('fretboard');
    fretboard.innerHTML = '';

    // Render each string (row) - high E (string 1) at top, low E (string 6) at bottom
    for (let stringIndex = 5; stringIndex >= 0; stringIndex--) {
        const row = document.createElement('div');
        row.className = 'fret-row';

        // Open string (fret 0)
        const openCell = document.createElement('div');
        openCell.className = 'fret-cell open-string';
        openCell.dataset.string = stringIndex;
        openCell.dataset.fret = 0;
        openCell.addEventListener('click', handleFretClick);
        row.appendChild(openCell);

        // Frets 1 to NUM_FRETS
        for (let fret = 1; fret <= NUM_FRETS; fret++) {
            const cell = document.createElement('div');
            cell.className = 'fret-cell';
            if (fret === 1) cell.classList.add('nut-cell');
            cell.dataset.string = stringIndex;
            cell.dataset.fret = fret;
            cell.addEventListener('click', handleFretClick);
            row.appendChild(cell);
        }

        fretboard.appendChild(row);
    }

    // Add fret numbers
    const fretNumbers = document.createElement('div');
    fretNumbers.className = 'fret-numbers';
    const openLabel = document.createElement('span');
    openLabel.className = 'fret-number-label';
    openLabel.textContent = '0';
    fretNumbers.appendChild(openLabel);

    for (let i = 1; i <= NUM_FRETS; i++) {
        const label = document.createElement('span');
        label.className = 'fret-number-label';
        label.textContent = INLAY_FRETS.includes(i) ? `${i} ●` : i;
        fretNumbers.appendChild(label);
    }
    fretboard.appendChild(fretNumbers);

    // Build note positions map
    buildNotePositions();
}

function buildNotePositions() {
    notePositions = {};
    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        for (let fret = 0; fret <= NUM_FRETS; fret++) {
            const key = `${stringIndex}-${fret}`;
            notePositions[key] = getNoteAtPosition(stringIndex, fret);
        }
    }
}

// Handle fret click
function handleFretClick(e) {
    const cell = e.currentTarget;
    const stringIndex = parseInt(cell.dataset.string);
    const fret = parseInt(cell.dataset.fret);
    const key = `${stringIndex}-${fret}`;

    if (selectedNotes.has(key)) {
        // Remove note
        selectedNotes.delete(key);
        const marker = cell.querySelector('.fret-marker');
        if (marker) cell.removeChild(marker);
    } else {
        // Remove any existing note on the same string first
        const keysToRemove = [];
        selectedNotes.forEach(existingKey => {
            const existingString = parseInt(existingKey.split('-')[0]);
            if (existingString === stringIndex) {
                keysToRemove.push(existingKey);
            }
        });
        keysToRemove.forEach(keyToRemove => {
            selectedNotes.delete(keyToRemove);
            // Find and remove the marker from the DOM
            const existingCell = document.querySelector(`.fret-cell[data-string="${stringIndex}"][data-fret="${keyToRemove.split('-')[1]}"]`);
            if (existingCell) {
                const marker = existingCell.querySelector('.fret-marker');
                if (marker) existingCell.removeChild(marker);
            }
        });

        // Add new note
        selectedNotes.add(key);
        const note = notePositions[key];
        const marker = document.createElement('div');
        marker.className = 'fret-marker';
        marker.textContent = note;
        cell.appendChild(marker);
    }

    updateSelectedNotesDisplay();
    identifyChord(); // Auto-identify when notes change
}

// Update the selected notes display
function updateSelectedNotesDisplay() {
    const display = document.getElementById('notes-display');

    if (selectedNotes.size === 0) {
        display.textContent = t('noNotesSelected');
        return;
    }

    // Get unique note names
    const uniqueNotes = new Set();
    selectedNotes.forEach(key => {
        uniqueNotes.add(notePositions[key]);
    });

    display.innerHTML = '';
    uniqueNotes.forEach(note => {
        const chip = document.createElement('span');
        chip.className = 'note-chip';
        chip.textContent = note;
        display.appendChild(chip);
    });
}

// Convert note name to semitone number (0-11)
function noteToNumber(note) {
    return NOTES.indexOf(note);
}

// Get intervals between notes (relative to bass note)
function getIntervals(notes) {
    if (notes.length < 2) return [];

    const numbers = notes.map(noteToNumber).sort((a, b) => a - b);
    const bass = numbers[0];

    return numbers.map(n => (n - bass + 12) % 12);
}

// Find matching chords
function identifyChord() {
    const resultDiv = document.getElementById('chord-name-result');
    const detailsDiv = document.getElementById('chord-details');

    if (selectedNotes.size < 2) {
        resultDiv.textContent = '-';
        detailsDiv.textContent = t('selectTwo');
        return;
    }

    // Get unique notes
    const uniqueNotes = [];
    const seen = new Set();
    selectedNotes.forEach(key => {
        const note = notePositions[key];
        if (!seen.has(note)) {
            seen.add(note);
            uniqueNotes.push(note);
        }
    });

    if (uniqueNotes.length < 2) {
        resultDiv.textContent = '-';
        detailsDiv.textContent = t('selectDifferent');
        return;
    }

    // Try each note as potential root and find matching chord formulas
    const matches = [];

    uniqueNotes.forEach(potentialRoot => {
        const rootNum = noteToNumber(potentialRoot);

        // Calculate intervals from this root
        const intervals = uniqueNotes.map(n => {
            const noteNum = noteToNumber(n);
            return (noteNum - rootNum + 12) % 12;
        }).sort((a, b) => a - b);

        // Check against each chord formula
        Object.entries(CHORD_FORMULAS).forEach(([chordType, formula]) => {
            const formulaIntervals = formula.intervals.map(i => i % 12).sort((a, b) => a - b);

            // Check if intervals match (allowing for octave equivalence)
            const intervalsMatch = formulaIntervals.every(fi =>
                intervals.includes(fi)
            ) && intervals.every(i =>
                formulaIntervals.includes(i) || formula.intervals.includes(i) || formula.intervals.includes(i + 12)
            );

            if (intervalsMatch) {
                matches.push({
                    root: potentialRoot,
                    type: chordType,
                    suffix: formula.suffix,
                    fullName: potentialRoot + formula.suffix,
                    intervals: intervals,
                    formulaIntervals: formulaIntervals
                });
            }
        });
    });

    // Display results
    if (matches.length === 0) {
        resultDiv.textContent = t('unknown');

        // Find partial matches (closest chords)
        const partialMatches = findPartialMatches(uniqueNotes);

        let detailsHtml = `<p>${t('notes')}: ${uniqueNotes.join(', ')}</p>`;
        detailsHtml += `<p>${t('noMatch')}</p>`;

        if (partialMatches.length > 0) {
            detailsHtml += `<div class="possible-chords"><p><strong>${t('suggestions')}</strong></p>`;
            partialMatches.slice(0, 6).forEach(match => {
                detailsHtml += `
                    <div class="possible-chord-item"
                         onmouseenter="previewChord('${match.root}', '${match.type}')"
                         onmouseleave="restoreFretboard()"
                         onclick="pinChord('${match.root}', '${match.type}')">
                        <div class="chord-label">${match.fullName} (${match.type})</div>
                        <div class="chord-notes">${match.matchedNotes}/${match.totalNotes} ${t('notesMatch')} · ${match.missingNotes} ${t('missing')}</div>
                    </div>
                `;
            });
            detailsHtml += '</div>';
        }

        detailsDiv.innerHTML = detailsHtml;
    } else {
        // Sort matches - prefer simpler chords (fewer notes in formula)
        matches.sort((a, b) => a.formulaIntervals.length - b.formulaIntervals.length);

        const bestMatch = matches[0];
        resultDiv.textContent = bestMatch.fullName;

        let detailsHtml = `<p>${t('notes')}: ${uniqueNotes.join(', ')}</p>`;

        if (matches.length > 1) {
            detailsHtml += `<div class="possible-chords"><p><strong>${t('otherPossibilities')}</strong></p>`;
            matches.slice(1, 6).forEach(match => {
                detailsHtml += `
                    <div class="possible-chord-item"
                         onmouseenter="previewChord('${match.root}', '${match.type}')"
                         onmouseleave="restoreFretboard()"
                         onclick="pinChord('${match.root}', '${match.type}')">
                        <div class="chord-label">${match.fullName} (${match.type})</div>
                    </div>
                `;
            });
            detailsHtml += '</div>';
        }

        detailsDiv.innerHTML = detailsHtml;
    }
}

// Find partial chord matches (for unknown chords)
function findPartialMatches(userNotes) {
    const partials = [];
    const userNoteNums = userNotes.map(noteToNumber);

    // Try each note as potential root
    userNotes.forEach(potentialRoot => {
        const rootNum = noteToNumber(potentialRoot);

        Object.entries(CHORD_FORMULAS).forEach(([chordType, formula]) => {
            // Get the actual notes in this chord
            const chordNoteNums = formula.intervals.map(i => (rootNum + i) % 12);
            const chordNoteNames = chordNoteNums.map(n => NOTES[n]);

            // Count how many user notes are in this chord
            let matched = 0;
            userNoteNums.forEach(userNote => {
                if (chordNoteNums.includes(userNote)) {
                    matched++;
                }
            });

            // Count how many chord notes are missing from user input
            let missing = 0;
            chordNoteNums.forEach(chordNote => {
                if (!userNoteNums.includes(chordNote)) {
                    missing++;
                }
            });

            // Check for extra notes (notes user selected that aren't in the chord)
            let extra = 0;
            userNoteNums.forEach(userNote => {
                if (!chordNoteNums.includes(userNote)) {
                    extra++;
                }
            });

            // Score: higher is better (more matches, fewer missing, fewer extras)
            // Only include if at least half the user's notes match
            if (matched >= Math.ceil(userNoteNums.length / 2)) {
                const score = matched * 3 - missing - extra * 2;
                partials.push({
                    root: potentialRoot,
                    type: chordType,
                    suffix: formula.suffix,
                    fullName: potentialRoot + formula.suffix,
                    matchedNotes: matched,
                    totalNotes: userNoteNums.length,
                    missingNotes: missing,
                    extraNotes: extra,
                    chordNotes: chordNoteNames,
                    score: score
                });
            }
        });
    });

    // Sort by score (descending), then by fewer missing notes
    partials.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.missingNotes - b.missingNotes;
    });

    // Remove duplicates (same chord name)
    const seen = new Set();
    return partials.filter(p => {
        if (seen.has(p.fullName)) return false;
        seen.add(p.fullName);
        return true;
    });
}

// Preview a chord on the fretboard (hover effect)
function previewChord(root, chordType) {
    // Don't preview if a chord is already pinned
    if (pinnedChord) return;
    if (isPreviewing) return;
    isPreviewing = true;
    currentPreviewChord = { root, type: chordType };

    // Save current state
    savedNotes = new Set(selectedNotes);

    showChordOnFretboard(root, chordType, false); // Use green style for preview too
}

// Show a chord on the fretboard
function showChordOnFretboard(root, chordType, isPinned) {
    // Clear current markers
    document.querySelectorAll('.fret-marker').forEach(marker => marker.remove());

    // Get chord formula
    const formula = CHORD_FORMULAS[chordType];
    if (!formula) return;

    const rootNum = noteToNumber(root);
    const chordNoteNums = formula.intervals.map(i => (rootNum + i) % 12);

    // Find the best positions on the fretboard for these notes
    // Pick one position per string, preferring lower frets
    selectedNotes = new Set();

    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        for (let fret = 0; fret <= NUM_FRETS; fret++) {
            const noteNum = noteToNumber(getNoteAtPosition(stringIndex, fret));
            if (chordNoteNums.includes(noteNum)) {
                const key = `${stringIndex}-${fret}`;
                selectedNotes.add(key);

                // Add visual marker with green preview style
                const cell = document.querySelector(`.fret-cell[data-string="${stringIndex}"][data-fret="${fret}"]`);
                if (cell) {
                    const marker = document.createElement('div');
                    marker.className = 'fret-marker preview-marker';
                    marker.textContent = NOTES[noteNum];
                    cell.appendChild(marker);
                }
                break; // Only one note per string
            }
        }
    }

    updateSelectedNotesDisplay();

    // Update the result display
    document.getElementById('chord-name-result').textContent = root + formula.suffix;
}

// Restore the fretboard after hover
function restoreFretboard() {
    // Don't restore if a chord is pinned
    if (pinnedChord) return;
    if (!isPreviewing || !savedNotes) return;
    isPreviewing = false;

    // Clear preview markers
    document.querySelectorAll('.fret-marker').forEach(marker => marker.remove());

    // Restore saved notes
    selectedNotes = savedNotes;
    savedNotes = null;

    // Re-render markers for saved notes
    selectedNotes.forEach(key => {
        const [stringIndex, fret] = key.split('-').map(Number);
        const note = notePositions[key];
        const cell = document.querySelector(`.fret-cell[data-string="${stringIndex}"][data-fret="${fret}"]`);
        if (cell) {
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.textContent = note;
            cell.appendChild(marker);
        }
    });

    updateSelectedNotesDisplay();
    identifyChord();
}

// Pin a chord (click to hold the preview)
function pinChord(root, chordType) {
    // If already pinned on the same chord, unpin it (toggle off)
    if (pinnedChord && pinnedChord.root === root && pinnedChord.type === chordType) {
        cancelPreview();
        return;
    }

    // If already pinned on a different chord, unpin first
    if (pinnedChord) {
        cancelPreview();
    }

    // Save current state if not already saved (and not currently previewing)
    if (!isPreviewing && !savedNotes) {
        savedNotes = new Set(selectedNotes);
    }

    // If currently previewing this chord, pin it (hold the state)
    if (isPreviewing) {
        isPreviewing = false;
        currentPreviewChord = null;
    }

    // Set pinned state
    pinnedChord = { root, type: chordType };

    // Show the chord on fretboard
    showChordOnFretboard(root, chordType, false);

    // Show cancel button
    document.getElementById('cancel-btn').style.display = 'inline-block';

    // Highlight the active suggestion card
    highlightSuggestionCard(root, chordType);

    // Scroll to top so user can see the fretboard result
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancel pinned preview and restore original notes
function cancelPreview() {
    if (!pinnedChord && !isPreviewing) return;

    pinnedChord = null;
    isPreviewing = false;
    currentPreviewChord = null;

    // Clear all markers
    document.querySelectorAll('.fret-marker').forEach(marker => marker.remove());

    // Restore saved notes if available
    if (savedNotes) {
        selectedNotes = savedNotes;
        savedNotes = null;

        // Re-render markers for saved notes
        selectedNotes.forEach(key => {
            const [stringIndex, fret] = key.split('-').map(Number);
            const note = notePositions[key];
            const cell = document.querySelector(`.fret-cell[data-string="${stringIndex}"][data-fret="${fret}"]`);
            if (cell) {
                const marker = document.createElement('div');
                marker.className = 'fret-marker';
                marker.textContent = note;
                cell.appendChild(marker);
            }
        });
    }

    // Hide cancel button
    document.getElementById('cancel-btn').style.display = 'none';

    // Remove highlight from suggestion cards
    document.querySelectorAll('.possible-chord-item').forEach(item => {
        item.classList.remove('active-suggestion');
    });

    updateSelectedNotesDisplay();
    identifyChord();
}

// Highlight the active suggestion card
function highlightSuggestionCard(root, chordType) {
    // Remove highlight from all cards
    document.querySelectorAll('.possible-chord-item').forEach(item => {
        item.classList.remove('active-suggestion');
    });

    // Find and highlight the matching card (exact match)
    const fullName = root + CHORD_FORMULAS[chordType].suffix;
    const typeName = chordType;
    document.querySelectorAll('.possible-chord-item').forEach(item => {
        const label = item.querySelector('.chord-label');
        if (label) {
            // Check for exact match: "ChordName (Type)"
            const labelText = label.textContent.trim();
            if (labelText === `${fullName} (${typeName})`) {
                item.classList.add('active-suggestion');
            }
        }
    });
}

// Clear all selections
function clearAll() {
    pinnedChord = null;
    isPreviewing = false;
    savedNotes = null;
    currentPreviewChord = null;
    selectedNotes.clear();
    document.querySelectorAll('.fret-marker').forEach(marker => marker.remove());
    updateSelectedNotesDisplay();
    document.getElementById('chord-name-result').textContent = '-';
    document.getElementById('chord-details').textContent = '';
    document.getElementById('cancel-btn').style.display = 'none';
    document.querySelectorAll('.possible-chord-item').forEach(item => {
        item.classList.remove('active-suggestion');
    });
}

function shiftChord(direction) {
    if (selectedNotes.size === 0) return;

    const positions = [...selectedNotes].map(key => key.split('-').map(Number));
    const canShift = positions.every(([, fret]) => {
        const nextFret = fret + direction;
        return nextFret >= 0 && nextFret <= NUM_FRETS;
    });
    if (!canShift) return;

    pinnedChord = null;
    isPreviewing = false;
    savedNotes = null;
    currentPreviewChord = null;
    document.getElementById('cancel-btn').style.display = 'none';
    document.querySelectorAll('.possible-chord-item').forEach(item => {
        item.classList.remove('active-suggestion');
    });

    selectedNotes = new Set(positions.map(([stringIndex, fret]) => `${stringIndex}-${fret + direction}`));
    document.querySelectorAll('.fret-marker').forEach(marker => marker.remove());
    selectedNotes.forEach(key => {
        const [stringIndex, fret] = key.split('-').map(Number);
        const cell = document.querySelector(`.fret-cell[data-string="${stringIndex}"][data-fret="${fret}"]`);
        if (cell) {
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.textContent = notePositions[key];
            cell.appendChild(marker);
        }
    });

    updateSelectedNotesDisplay();
    identifyChord();
}

// Event listeners
document.getElementById('shift-left-btn').addEventListener('click', () => shiftChord(-1));
document.getElementById('shift-right-btn').addEventListener('click', () => shiftChord(1));
document.getElementById('clear-btn').addEventListener('click', clearAll);
document.getElementById('cancel-btn').addEventListener('click', cancelPreview);

document.addEventListener('languagechange', () => {
    updateSelectedNotesDisplay();
    identifyChord();
});

// Initialize
renderFretboard();
