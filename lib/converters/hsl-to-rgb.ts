export function convertHslToRgb(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*[0-9.]+)?\s*\)/gi,
    (_, hStr, sStr, lStr) => {
      const h = parseFloat(hStr), s = parseFloat(sStr) / 100, l = parseFloat(lStr) / 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
      return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
    }
  );
}
