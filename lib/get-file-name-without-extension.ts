/**
 * Take a file name and returns it without the extension
 */
export function getFileNameWithoutExtension(fileName: string): string {
  const parts = fileName.split('.');
  parts.pop();
  return parts.join('.');
}
