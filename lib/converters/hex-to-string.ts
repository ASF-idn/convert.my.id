export function convertHexToString(input: string): string {
  const clean = input.trim().replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
  if (!clean) return '';
  if (clean.length % 2 !== 0) throw new Error('Hex string must have an even number of hex digits.');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return new TextDecoder('utf-8').decode(bytes);
}
