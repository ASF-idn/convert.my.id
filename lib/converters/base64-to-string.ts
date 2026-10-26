export function convertBase64ToString(input: string): string {
  const clean = input.trim().replace(/[\r\n\s]+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!clean) return '';
  const pad = clean.length % 4;
  const padded = pad === 2 ? clean + '==' : pad === 3 ? clean + '=' : clean;
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
