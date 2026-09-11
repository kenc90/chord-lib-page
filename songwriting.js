const SONG_STORAGE_KEY = 'guitar-chords-library-song-draft';

let song = { title: '', keys: [], bpm: '', lyricsHtml: '', referenceShapes: {} };
let savedSelection = null;
let pendingChordRange = null;
let pendingKeys = [];

const SONG_KEYS = ['C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'Eb', 'Ebm', 'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm', 'Ab', 'Abm', 'A', 'Am', 'Bb', 'Bbm', 'B', 'Bm'];

const CHORD_CHOICES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].flatMap(note => [note, `${note}m`, `${note}7`, `${note}maj7`, `${note}m7`, `${note}sus4`]);

function chordDiagram(chordName, shapeIndex = 0) {
    const shape = getChordShapes(chordName)[shapeIndex];
    if (!shape) return '';
    const svg = renderChordDiagram(shape)
        .replace('class="chord-diagram"', 'class="chord-diagram reference-diagram"')
        .replace('viewBox="0 0 120 150"', 'viewBox="0 0 130 162"')
        .replace('<svg ', `<svg aria-label="${chordName} chord diagram" `);
    return svg.replace('</svg>', `${chordNotesSvg(shape)}</svg>`);
}

// Standard tuning open-string notes (low E to high E)
const CHORD_REFERENCE_OPEN_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];

function getSongScaleNotes() {
    const scaleNotes = new Set();
    song.keys.forEach(key => {
        const isMinor = key.endsWith('m');
        const root = isMinor ? key.slice(0, -1) : key;
        const rootIndex = NOTE_REFERENCE_NOTES.indexOf(root);
        if (rootIndex === -1) return;
        const intervals = (isMinor ? NOTE_REFERENCE_SCALES.minor : NOTE_REFERENCE_SCALES.major).intervals;
        intervals.forEach(interval => scaleNotes.add(NOTE_REFERENCE_NOTES[(rootIndex + interval) % 12]));
    });
    return scaleNotes;
}

function chordNotesSvg(shape) {
    const notes = [];
    shape.frets.forEach((fret, i) => {
        if (fret < 0) return;
        const openIndex = CHORD_REFERENCE_OPEN_NOTES[i];
        const openNoteIndex = NOTE_REFERENCE_NOTES.indexOf(openIndex);
        notes.push(NOTE_REFERENCE_NOTES[(openNoteIndex + fret) % 12]);
    });
    const uniqueNotes = [...new Set(notes)];
    const scaleNotes = getSongScaleNotes();
    const charWidth = 9;
    const gap = 6;
    const totalWidth = uniqueNotes.reduce((sum, note) => sum + note.length * charWidth, 0) + gap * (uniqueNotes.length - 1);
    let cursor = 65 - totalWidth / 2;
    const text = uniqueNotes.map(note => {
        const inScale = scaleNotes.has(note);
        const width = note.length * charWidth;
        const x = cursor + width / 2;
        cursor += width + gap;
        const tooltip = inScale ? '' : `<title>${t('noteNotInKey')}</title>`;
        return `<g class="reference-diagram-note${inScale ? '' : ' out-of-scale'}"${inScale ? '' : ` data-tooltip="${t('noteNotInKey')}"`}><text x="${x}" y="154" text-anchor="middle" dominant-baseline="middle">${tooltip}${note}</text></g>`;
    }).join('');
    return text;
}

function getChordShapes(chordName) {
    const primaryShape = Object.values(CHORDS).flat().find(chord => chord.name === chordName);
    const alternateShapes = CHORD_VOICINGS[chordName] || [];
    return primaryShape ? [primaryShape, ...alternateShapes.filter(shape => shape.frets.join(',') !== primaryShape.frets.join(','))] : alternateShapes;
}

function saveSong() {
    localStorage.setItem(SONG_STORAGE_KEY, JSON.stringify(song));
}

function loadSong() {
    try {
        const savedSong = JSON.parse(localStorage.getItem(SONG_STORAGE_KEY));
        if (typeof savedSong?.lyricsHtml === 'string') {
            song = { title: String(savedSong.title || ''), keys: normalizeKeys(savedSong.keys ?? savedSong.key), bpm: String(savedSong.bpm || ''), lyricsHtml: savedSong.lyricsHtml, referenceShapes: savedSong.referenceShapes || {} };
        } else if (savedSong?.lines?.length) {
            song = {
                title: String(savedSong.title || ''), keys: [], bpm: '', referenceShapes: {},
                lyricsHtml: savedSong.lines.map(line => `<div>${escapeHtml(String(line.lyrics || ''))}</div>`).join('')
            };
        }
    } catch {
        localStorage.removeItem(SONG_STORAGE_KEY);
    }
}

function normalizeLyricsHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('div, p').forEach(line => {
        if (!line.textContent.trim() && !line.querySelector('.chord-annotation')) line.remove();
    });
    return template.innerHTML;
}

function renderReference() {
    const chordNames = [...new Set([...document.querySelectorAll('.chord-label')].map(label => label.dataset.chord))];
    const reference = document.getElementById('chord-reference');
    document.getElementById('reference-count').textContent = chordNames.length;
    reference.innerHTML = chordNames.length
        ? chordNames.map(name => {
            const shapes = getChordShapes(name);
            const selectedIndex = Math.min(song.referenceShapes[name] || 0, shapes.length - 1);
            const clickableClass = shapes.length > 1 ? ' shape-switchable' : '';
            const diagram = chordDiagram(name, selectedIndex);
            const diagramControl = shapes.length > 1 ? `<button class="shape-diagram-btn" type="button" data-chord="${name}" aria-label="Switch ${name} chord shape" title="Switch chord shape">${diagram}</button>` : diagram;
            return `<div class="reference-chord${clickableClass}"><div class="reference-chord-name">${name}</div>${diagramControl}</div>`;
        }).join('')
        : `<p class="empty-reference">${t('emptyChordReference')}</p>`;
    reference.querySelectorAll('.shape-diagram-btn').forEach(button => {
        button.addEventListener('click', () => openShapePicker(button.dataset.chord));
    });
}

let pickerChord = null;

function openShapePicker(chordName) {
    pickerChord = chordName;
    renderShapeOptions();
    document.getElementById('shape-picker-title').textContent = chordName;
    const modal = document.getElementById('shape-picker-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeShapePicker() {
    const modal = document.getElementById('shape-picker-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    pickerChord = null;
}

function renderShapeOptions() {
    const grid = document.getElementById('shape-picker-grid');
    const shapes = getChordShapes(pickerChord);
    const selectedIndex = Math.min(song.referenceShapes[pickerChord] || 0, shapes.length - 1);
    grid.innerHTML = shapes.map((shape, index) => `<button class="shape-option${index === selectedIndex ? ' selected' : ''}" type="button" data-index="${index}" aria-pressed="${index === selectedIndex}" title="${escapeHtml(shape.label || '')}"><div class="shape-option-name">${shape.label || `${t('chordShape')} ${index + 1}`}</div>${chordDiagram(pickerChord, index)}</button>`).join('');
    grid.querySelectorAll('.shape-option').forEach(option => option.addEventListener('click', () => {
        song.referenceShapes[pickerChord] = Number(option.dataset.index);
        saveSong();
        closeShapePicker();
        renderReference();
    }));
}

function escapeHtml(value) {
    return value.replace(/&/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function addChord(chordName) {
    const sheet = document.getElementById('lyrics-sheet');
    if (!chordName || !pendingChordRange || !sheet.contains(pendingChordRange.commonAncestorContainer)) return;

    const annotation = document.createElement('span');
    annotation.className = 'chord-annotation';
    annotation.innerHTML = `<button class="chord-label" type="button" contenteditable="false" data-chord="${escapeHtml(chordName)}" title="${t('removeChord')}">${escapeHtml(chordName)}</button>`;
    pendingChordRange.insertNode(annotation);
    pendingChordRange.setStartAfter(annotation);
    pendingChordRange.collapse(true);
    pendingChordRange = null;
    syncSheet();
    renderReference();
    closeChordFinder();
}

function openChordFinder(event) {
    const sheet = document.getElementById('lyrics-sheet');
    if (event.target.closest('.chord-label')) return;

    const line = event.target.closest('div, p') || sheet.lastElementChild || sheet;
    const lineBounds = line.getBoundingClientRect();
    if (!line.textContent.trim() || event.clientY > lineBounds.top + 24) return;

    const caretRange = document.caretRangeFromPoint(event.clientX, lineBounds.top + 28);
    if (!caretRange || !sheet.contains(caretRange.commonAncestorContainer)) return;

    pendingChordRange = caretRange.cloneRange();
    const modal = document.getElementById('chord-finder-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const search = document.getElementById('chord-finder-search');
    search.value = '';
    renderChordChoices();
    search.focus();
}

function updateSnapIndicator(event) {
    const sheet = document.getElementById('lyrics-sheet');
    const indicator = sheet.querySelector('.chord-snap-indicator');
    const line = event.target.closest('div, p');
    if (!line || event.clientY > line.getBoundingClientRect().top + 24) {
        indicator.classList.remove('visible');
        return;
    }
    const sheetBounds = sheet.getBoundingClientRect();
    const lineBounds = line.getBoundingClientRect();
    indicator.style.left = `${event.clientX - sheetBounds.left}px`;
    indicator.style.top = `${lineBounds.top - sheetBounds.top + 3}px`;
    indicator.classList.add('visible');
}

function renderChordChoices() {
    const query = document.getElementById('chord-finder-search').value.trim().toLowerCase();
    const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const relatedChords = song.keys.flatMap(key => {
        const isMinor = key.endsWith('m');
        const keyIndex = notes.indexOf(isMinor ? key.slice(0, -1) : key);
        if (keyIndex === -1) return [];
        return isMinor
            ? [
                `${notes[keyIndex]}m`,
                `${notes[(keyIndex + 2) % 12]}m`,
                `${notes[(keyIndex + 3) % 12]}`,
                `${notes[(keyIndex + 5) % 12]}m`,
                `${notes[(keyIndex + 7) % 12]}m`,
                `${notes[(keyIndex + 8) % 12]}`
            ]
            : [
                notes[keyIndex],
                `${notes[(keyIndex + 2) % 12]}m`,
                `${notes[(keyIndex + 4) % 12]}m`,
                notes[(keyIndex + 5) % 12],
                notes[(keyIndex + 7) % 12],
                `${notes[(keyIndex + 9) % 12]}m`
            ];
    });
    const choices = CHORD_CHOICES.filter(chord => chord.toLowerCase().includes(query));
    const related = choices.filter(chord => relatedChords.includes(chord));
    const other = choices.filter(chord => !relatedChords.includes(chord));
    const buttons = chords => chords.map(chord => `<button class="chord-choice" type="button" data-chord="${chord}">${chord}</button>`).join('');
    const relatedSection = related.length ? `<section class="chord-choice-section related-chord-section"><h3>${t('relatedChords')}</h3><div class="chord-choice-grid">${buttons(related)}</div></section>` : '';
    const otherSection = other.length ? `<section class="chord-choice-section other-chord-section"><h3>${t('otherChords')}</h3><div class="chord-choice-grid">${buttons(other)}</div></section>` : '';
    document.getElementById('chord-finder-results').innerHTML = `${relatedSection}${otherSection}` || `<p class="no-chords-found">${t('noChordsFound')}</p>`;
    document.querySelectorAll('.chord-choice').forEach(button => button.addEventListener('click', () => addChord(button.dataset.chord)));
}

function closeChordFinder() {
    const modal = document.getElementById('chord-finder-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    pendingChordRange = null;
}

function removeChord(event) {
    const annotation = event.target.closest('.chord-annotation');
    if (!annotation) return;
    const fragment = document.createDocumentFragment();
    [...annotation.childNodes].forEach(node => {
        if (!node.classList?.contains('chord-label')) fragment.appendChild(node);
    });
    annotation.replaceWith(fragment);
    syncSheet();
    renderReference();
}

function syncSheet() {
    const sheet = document.getElementById('lyrics-sheet');
    const indicator = sheet.querySelector('.chord-snap-indicator');
    indicator?.remove();
    song.lyricsHtml = normalizeLyricsHtml(sheet.innerHTML);
    sheet.insertAdjacentHTML('beforeend', '<span class="chord-snap-indicator" contenteditable="false"></span>');
    saveSong();
}

function rememberSelection() {
    const selection = window.getSelection();
    const sheet = document.getElementById('lyrics-sheet');
    if (selection.rangeCount && sheet.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        savedSelection = selection.getRangeAt(0).cloneRange();
    }
}

function pastePlainText(event) {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
}

function exportSong() {
    const data = JSON.stringify(song, null, 2);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    link.download = `${song.title.trim() || 'song'}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function hasSongContent() {
    const sheet = document.getElementById('lyrics-sheet');
    const hasLyrics = sheet.textContent.trim().length > 0;
    const hasTitle = song.title.trim().length > 0;
    const hasKeys = song.keys.length > 0;
    const hasBpm = song.bpm.trim().length > 0;
    return hasLyrics || hasTitle || hasKeys || hasBpm;
}

function applyImportedSong(importedSong) {
    if (typeof importedSong.lyricsHtml !== 'string') throw new Error('Invalid song');
    song = { title: String(importedSong.title || ''), keys: normalizeKeys(importedSong.keys ?? importedSong.key), bpm: String(importedSong.bpm || ''), lyricsHtml: importedSong.lyricsHtml, referenceShapes: importedSong.referenceShapes || {} };
    document.getElementById('song-title').value = song.title;
    saveSong();
    renderSong();
}

let confirmCallback = null;

function showConfirmModal(message, onConfirm) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-ok').textContent = t('confirm');
    confirmCallback = onConfirm;
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    confirmCallback = null;
}

function showAlertModal(message) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-ok').textContent = t('close');
    confirmCallback = null;
    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function confirmModal(message) {
    return new Promise(resolve => {
        showConfirmModal(message, resolve);
    });
}

function importSongText(text) {
    try {
        const importedSong = JSON.parse(text);
        if (hasSongContent()) {
            showConfirmModal(t('confirmOverwriteSong'), () => applyImportedSong(importedSong));
        } else {
            applyImportedSong(importedSong);
        }
    } catch {
        showAlertModal(t('invalidSongFile'));
    }
}

function importSong(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importSongText(reader.result);
    reader.readAsText(file);
    event.target.value = '';
}

function newSong() {
    if (hasSongContent()) {
        showConfirmModal(t('confirmNewSong'), () => {
            song = { title: '', keys: [], bpm: '', lyricsHtml: '', referenceShapes: {} };
            saveSong();
            renderSong();
        });
    } else {
        song = { title: '', keys: [], bpm: '', lyricsHtml: '', referenceShapes: {} };
        saveSong();
        renderSong();
    }
}

function normalizeKeys(value) {
    const list = Array.isArray(value) ? value : (value ? [value] : []);
    return [...new Set(list.filter(key => SONG_KEYS.includes(key)))];
}

function renderSongKeyButton() {
    const button = document.getElementById('song-key-btn');
    button.textContent = song.keys.length ? song.keys.join(' · ') : '-';
}

const NOTE_REFERENCE_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_REFERENCE_SCALES = {
    major: { intervals: [0, 2, 4, 5, 7, 9, 11], types: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'] },
    minor: { intervals: [0, 2, 3, 5, 7, 8, 10], types: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'] }
};

function renderNoteReference() {
    const container = document.getElementById('note-reference');
    if (!song.keys.length) {
        container.innerHTML = `<p class="empty-reference">${t('emptyNoteReference')}</p>`;
        return;
    }
    container.innerHTML = song.keys.map(key => {
        const isMinor = key.endsWith('m');
        const root = isMinor ? key.slice(0, -1) : key;
        const rootIndex = NOTE_REFERENCE_NOTES.indexOf(root);
        if (rootIndex === -1) return '';
        const scale = isMinor ? NOTE_REFERENCE_SCALES.minor : NOTE_REFERENCE_SCALES.major;
        const notes = scale.intervals.map(interval => NOTE_REFERENCE_NOTES[(rootIndex + interval) % 12]);
        const chords = notes.map((note, i) => {
            const type = scale.types[i];
            const suffix = type === 'maj' ? '' : type === 'min' ? 'm' : 'dim';
            return `${note}${suffix}`;
        });
        return `<div class="note-key-group"><span class="note-key-name">${escapeHtml(key)}</span><div class="note-key-chips">${notes.map((note, i) => `<span class="note-chip${i === 0 ? ' root' : ''}"><span class="note-chip-note">${note}</span><span class="note-chip-chord">${chords[i]}</span></span>`).join('')}</div></div>`;
    }).join('');
}

function renderSongKeyOptions() {
    const container = document.getElementById('song-key-options');
    container.innerHTML = SONG_KEYS.map(key => `<button class="song-key-option${pendingKeys.includes(key) ? ' selected' : ''}" type="button" data-key="${key}" aria-pressed="${pendingKeys.includes(key)}">${key}</button>`).join('');
    container.querySelectorAll('.song-key-option').forEach(option => option.addEventListener('click', () => {
        const key = option.dataset.key;
        pendingKeys = pendingKeys.includes(key) ? pendingKeys.filter(k => k !== key) : [...pendingKeys, key];
        renderSongKeyOptions();
    }));
}

function openSongKeyModal() {
    pendingKeys = [...song.keys];
    renderSongKeyOptions();
    const modal = document.getElementById('song-key-modal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeSongKeyModal() {
    const modal = document.getElementById('song-key-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    pendingKeys = [];
}

function renderSong() {
    document.getElementById('song-title').value = song.title;
    renderSongKeyButton();
    document.getElementById('song-bpm').value = song.bpm;
    song.lyricsHtml = normalizeLyricsHtml(song.lyricsHtml);
    document.getElementById('lyrics-sheet').innerHTML = song.lyricsHtml;
    document.getElementById('lyrics-sheet').insertAdjacentHTML('beforeend', '<span class="chord-snap-indicator" contenteditable="false"></span>');
    renderReference();
    renderNoteReference();
}

document.getElementById('song-title').addEventListener('input', event => {
    song.title = event.target.value;
    saveSong();
});
document.getElementById('song-key-btn').addEventListener('click', openSongKeyModal);
document.getElementById('close-song-key').addEventListener('click', closeSongKeyModal);
document.getElementById('song-key-modal').addEventListener('click', event => {
    if (event.target.id === 'song-key-modal') closeSongKeyModal();
});
document.getElementById('clear-song-keys').addEventListener('click', () => {
    pendingKeys = [];
    renderSongKeyOptions();
});
document.getElementById('apply-song-keys').addEventListener('click', () => {
    song.keys = [...pendingKeys];
    saveSong();
    renderSongKeyButton();
    renderNoteReference();
    closeSongKeyModal();
});
document.getElementById('song-bpm').addEventListener('input', event => {
    song.bpm = event.target.value;
    saveSong();
});
document.getElementById('lyrics-sheet').addEventListener('input', () => {
    syncSheet();
    renderReference();
});
document.getElementById('lyrics-sheet').addEventListener('mouseup', rememberSelection);
document.getElementById('lyrics-sheet').addEventListener('keyup', rememberSelection);
document.getElementById('lyrics-sheet').addEventListener('paste', pastePlainText);
document.getElementById('lyrics-sheet').addEventListener('click', event => {
    if (event.target.classList.contains('chord-label')) removeChord(event);
});
document.getElementById('lyrics-sheet').addEventListener('mousedown', openChordFinder);
document.getElementById('lyrics-sheet').addEventListener('pointermove', updateSnapIndicator);
document.getElementById('lyrics-sheet').addEventListener('pointerleave', () => document.querySelector('.chord-snap-indicator')?.classList.remove('visible'));
document.getElementById('lyrics-sheet').addEventListener('dragenter', event => {
    event.preventDefault();
    if (event.dataTransfer.types.includes('Files')) {
        document.getElementById('lyrics-sheet').classList.add('drag-over');
    }
});
document.getElementById('lyrics-sheet').addEventListener('dragover', event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (event.dataTransfer.types.includes('Files')) {
        document.getElementById('lyrics-sheet').classList.add('drag-over');
    }
});
document.getElementById('lyrics-sheet').addEventListener('dragleave', event => {
    if (!document.getElementById('lyrics-sheet').contains(event.relatedTarget)) {
        document.getElementById('lyrics-sheet').classList.remove('drag-over');
    }
});
document.getElementById('lyrics-sheet').addEventListener('drop', event => {
    event.preventDefault();
    document.getElementById('lyrics-sheet').classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importSongText(reader.result);
    reader.readAsText(file);
});
document.getElementById('chord-finder-search').addEventListener('input', renderChordChoices);
document.getElementById('close-chord-finder').addEventListener('click', closeChordFinder);
document.getElementById('chord-finder-modal').addEventListener('click', event => {
    if (event.target.id === 'chord-finder-modal') closeChordFinder();
});
document.getElementById('close-shape-picker').addEventListener('click', closeShapePicker);
document.getElementById('shape-picker-modal').addEventListener('click', event => {
    if (event.target.id === 'shape-picker-modal') closeShapePicker();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeShapePicker();
        closeChordFinder();
        closeConfirmModal();
    }
});
document.getElementById('export-btn').addEventListener('click', exportSong);
document.getElementById('new-song-btn').addEventListener('click', newSong);
document.getElementById('import-input').addEventListener('change', importSong);
document.getElementById('confirm-ok').addEventListener('click', () => {
    const callback = confirmCallback;
    closeConfirmModal();
    if (callback) callback(true);
});
document.getElementById('confirm-cancel').addEventListener('click', closeConfirmModal);
document.getElementById('close-confirm').addEventListener('click', closeConfirmModal);
document.getElementById('confirm-modal').addEventListener('click', event => {
    if (event.target.id === 'confirm-modal') closeConfirmModal();
});
document.addEventListener('languagechange', renderSong);

loadSong();
renderSong();
