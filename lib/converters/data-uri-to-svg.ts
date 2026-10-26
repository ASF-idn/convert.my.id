export function convertDataUriToSvg(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  let uri = trimmed;
  const urlMatch = trimmed.match(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/i);
  if (urlMatch) uri = urlMatch[1];

  if (uri.includes(';base64,')) {
    const b64 = uri.slice(uri.indexOf(';base64,') + 8);
    return atob(b64).trim();
  }

  const prefixIdx = uri.indexOf('data:image/svg+xml,');
  const payload = prefixIdx !== -1 ? uri.slice(prefixIdx + 'data:image/svg+xml,'.length) : uri;
  return decodeURIComponent(payload)
    .replace(/></g, '>\n<')
    .trim();
}
