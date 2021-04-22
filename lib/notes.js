const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getNoteOctave(midiCode) {
  return Math.floor(midiCode / 12 - 1);
}
export function getNoteName(midiCode) {
  const octave = getNoteOctave(midiCode);
  const noteName = notes[midiCode % 12];
  return `${noteName}${octave}`;
}
