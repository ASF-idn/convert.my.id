import type { TextConversionOptions } from '@/types/converter';

export function convertPxToEm(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    return `${Number((px / base).toFixed(4))}em`;
  }
  return input.replace(/(-?\d*\.?\d+)px\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    return px === 0 ? '0' : `${Number((px / base).toFixed(4))}em`;
  });
}
