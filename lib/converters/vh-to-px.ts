export function convertVhToPx(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const vhBase = 1080;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(vh)?$/i);
  if (single) {
    const vh = parseFloat(single[1]);
    return `${Number(((vh / 100) * vhBase).toFixed(2))}px /* @1080px viewport height */`;
  }
  return input.replace(/(-?\d*\.?\d+)vh\b/gi, (_, n: string) => {
    const vh = parseFloat(n);
    return vh === 0 ? '0' : `${Number(((vh / 100) * vhBase).toFixed(2))}px`;
  });
}
