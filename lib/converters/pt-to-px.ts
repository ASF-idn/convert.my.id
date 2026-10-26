export function convertPtToPx(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\d*\.?\d+)(?:pt)?\b/gi, (m, n: string) => {
    if (!n) return m;
    const pt = parseFloat(n);
    if (Number.isNaN(pt)) return m;
    return `${Number((pt / 0.75).toFixed(2))}px`;
  });
}
