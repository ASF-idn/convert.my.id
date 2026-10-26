export function convertUrlEncode(input: string): string {
  if (!input) return '';
  return [
    '/* encodeURIComponent (Strict Parameter Encoding) */',
    encodeURIComponent(input),
    '',
    '/* encodeURI (Full URL Preserving : / ? & =) */',
    encodeURI(input),
  ].join('\n');
}
