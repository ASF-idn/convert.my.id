import type { TextConversionOptions } from '@/types/converter';

export function convertRemToPx(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(rem)?$/i);
  if (single) {
    const rem = parseFloat(single[1]);
    const px = Number((rem * base).toFixed(2));
    return `${px}px\n\n/* ${rem}rem * ${base}px = ${px}px */`;
  }
  return input.replace(/(-?\d*\.?\d+)rem\b/gi, (_, n: string) => {
    const rem = parseFloat(n);
    if (rem === 0) return '0';
    return `${Number((rem * base).toFixed(2))}px`;
  });
}
