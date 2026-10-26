import type { TextConversionOptions } from '@/types/converter';

export function convertPxToRem(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const prec = typeof options.precision === 'number' ? options.precision : 4;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    const rem = Number((px / base).toFixed(prec));
    return `${rem}rem\n\n/* ${px}px / ${base}px = ${rem}rem */`;
  }
  return input.replace(/(-?\d*\.?\d+)px\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    if (px === 0) return '0';
    return `${Number((px / base).toFixed(prec))}rem`;
  });
}
