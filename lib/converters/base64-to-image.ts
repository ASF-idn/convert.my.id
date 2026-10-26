export function convertBase64ToImage(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const dataUri = trimmed.startsWith('data:image/')
    ? trimmed
    : `data:image/png;base64,${trimmed.replace(/\s+/g, '')}`;
  const mimeMatch = dataUri.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const rawB64 = dataUri.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  const approxBytes = Math.round((rawB64.length * 3) / 4);

  return [
    `<!-- Decoded Image Metadata (convert.my.id) -->`,
    `<!-- MIME Type: ${mime} | Approx Binary Size: ${approxBytes} bytes -->`,
    `<img src="${dataUri}" alt="Decoded Base64 Image" />`,
  ].join('\n');
}
