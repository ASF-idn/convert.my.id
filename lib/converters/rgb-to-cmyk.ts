export function convertRgbToCmyk(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[0-9.]+)?\s*\)/gi,
    (_, rStr, gStr, bStr) => {
      const r = Number(rStr) / 255, g = Number(gStr) / 255, b = Number(bStr) / 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
      const c = Math.round(((1 - r - k) / (1 - k)) * 100);
      const m = Math.round(((1 - g - k) / (1 - k)) * 100);
      const y = Math.round(((1 - b - k) / (1 - k)) * 100);
      const kPct = Math.round(k * 100);
      return `cmyk(${c}%, ${m}%, ${y}%, ${kPct}%)`;
    }
  );
}
