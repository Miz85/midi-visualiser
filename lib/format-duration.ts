function formatDurationPart(part: number): string {
  if (part < 0) {
    return '00';
  }
  return part < 10 ? `0${part}` : `${part}`;
}

export function formatDuration(nbSeconds: number): string {
  const minutes = Math.floor(nbSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const seconds = Math.round((nbSeconds / 60 - minutes) * 60);
  return `${formatDurationPart(hours)}:${formatDurationPart(
    minutes
  )}:${formatDurationPart(seconds)}`;
}
