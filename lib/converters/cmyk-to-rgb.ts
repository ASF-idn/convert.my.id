export function convertCmykToRgb(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /cmyk\(\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?\s*\)/gi,
    (_, cStr, mStr, yStr, kStr) => {
      const c = parseFloat(cStr) / 100, m = parseFloat(mStr) / 100, y = parseFloat(yStr) / 100, k = parseFloat(kStr) / 100;
      const r = Math.round(255 * (1 - c) * (1 - k));
      const g = Math.round(255 * (1 - m) * (1 - k));
      const b = Math.round(255 * (1 - y) * (1 - k));
      return `rgb(${r}, ${g}, ${b})`;
    }
  );
}
