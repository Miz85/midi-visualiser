const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getNoteOctave(midiCode: number): number {
  return Math.floor(midiCode / 12 - 1);
}

export function getNoteName(midiCode: number): string {
  const octave = getNoteOctave(midiCode);
  const noteName = notes[midiCode % 12];
  return `${noteName}${octave}`;
}
