import type { TextConversionOptions } from '@/types/converter';

export function convertStringToBase64(input: string, options: TextConversionOptions = {}): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(bin);
  return options.urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}
