const SONG_STORAGE_KEY = 'guitar-chords-library-song-draft';

let song = { title: '', key: '', bpm: '', lyricsHtml: '', referenceShapes: {} };
let savedSelection = null;
let pendingChordRange = null;

const CHORD_CHOICES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].flatMap(note => [note, `${note}m`, `${note}7`, `${note}maj7`, `${note}m7`, `${note}sus4`]);

function chordDiagram(chordName, shapeIndex = 0) {
    const shape = getChordShapes(chordName)[shapeIndex];
    if (!shape) return '';
    return renderChordDiagram(shape)
        .replace('class="chord-diagram"', 'class="chord-diagram reference-diagram"')
        .replace('<svg ', `<svg aria-label="${chordName} chord diagram" `);
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
            song = { title: String(savedSong.title || ''), key: String(savedSong.key || ''), bpm: String(savedSong.bpm || ''), lyricsHtml: savedSong.lyricsHtml, referenceShapes: savedSong.referenceShapes || {} };
        } else if (savedSong?.lines?.length) {
            song = {
                title: String(savedSong.title || ''), key: '', bpm: '', referenceShapes: {},
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
        button.addEventListener('click', () => {
            const shapes = getChordShapes(button.dataset.chord);
            song.referenceShapes[button.dataset.chord] = ((song.referenceShapes[button.dataset.chord] || 0) + 1) % shapes.length;
            saveSong();
            renderReference();
        });
    });
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
    if (event.clientY > lineBounds.top + 24) return;

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
    const keyIndex = { C: 0, 'C#': 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 }[song.key];
    const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const relatedChords = keyIndex === undefined
        ? []
        : [
            notes[keyIndex],
            `${notes[(keyIndex + 2) % 12]}m`,
            `${notes[(keyIndex + 4) % 12]}m`,
            notes[(keyIndex + 5) % 12],
            notes[(keyIndex + 7) % 12],
            `${notes[(keyIndex + 9) % 12]}m`
        ];
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

function importSong(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const importedSong = JSON.parse(reader.result);
            if (typeof importedSong.lyricsHtml !== 'string') throw new Error('Invalid song');
            song = { title: String(importedSong.title || ''), key: String(importedSong.key || ''), bpm: String(importedSong.bpm || ''), lyricsHtml: importedSong.lyricsHtml, referenceShapes: importedSong.referenceShapes || {} };
            document.getElementById('song-title').value = song.title;
            saveSong();
            renderSong();
        } catch {
            alert(t('invalidSongFile'));
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function renderSong() {
    document.getElementById('song-title').value = song.title;
    document.getElementById('song-key').value = song.key;
    document.getElementById('song-bpm').value = song.bpm;
    song.lyricsHtml = normalizeLyricsHtml(song.lyricsHtml);
    document.getElementById('lyrics-sheet').innerHTML = song.lyricsHtml;
    document.getElementById('lyrics-sheet').insertAdjacentHTML('beforeend', '<span class="chord-snap-indicator" contenteditable="false"></span>');
    renderReference();
}

document.getElementById('song-title').addEventListener('input', event => {
    song.title = event.target.value;
    saveSong();
});
document.getElementById('song-key').addEventListener('change', event => {
    song.key = event.target.value;
    saveSong();
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
document.getElementById('chord-finder-search').addEventListener('input', renderChordChoices);
document.getElementById('close-chord-finder').addEventListener('click', closeChordFinder);
document.getElementById('chord-finder-modal').addEventListener('click', event => {
    if (event.target.id === 'chord-finder-modal') closeChordFinder();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeChordFinder();
});
document.getElementById('export-btn').addEventListener('click', exportSong);
document.getElementById('import-input').addEventListener('change', importSong);
document.addEventListener('languagechange', renderSong);

loadSong();
renderSong();
