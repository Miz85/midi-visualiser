export function getFileNameWithoutExtension(midiFileName) {
  const parts = midiFileName.split('.');
  parts.pop();
  return parts.join('.');
}
