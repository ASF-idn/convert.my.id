export function convertPcToPx(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\d*\.?\d+)(?:pc)?\b/gi, (m, n: string) => {
    if (!n) return m;
    const pc = parseFloat(n);
    if (Number.isNaN(pc)) return m;
    return `${Number((pc * 16).toFixed(2))}px`;
  });
}
