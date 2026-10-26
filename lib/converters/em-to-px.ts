import type { TextConversionOptions } from '@/types/converter';

export function convertEmToPx(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(em)?$/i);
  if (single) {
    const em = parseFloat(single[1]);
    return `${Number((em * base).toFixed(2))}px`;
  }
  return input.replace(/(-?\d*\.?\d+)em\b/gi, (_, n: string) => {
    const em = parseFloat(n);
    return em === 0 ? '0' : `${Number((em * base).toFixed(2))}px`;
  });
}
