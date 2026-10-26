export function convertPxToPc(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\d*\.?\d+)(?:px)?\b/gi, (m, n: string) => {
    if (!n) return m;
    const px = parseFloat(n);
    if (Number.isNaN(px)) return m;
    return `${Number((px / 16).toFixed(4))}pc`;
  });
}
