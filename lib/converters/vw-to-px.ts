export function convertVwToPx(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const viewportWidth = 1920;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(vw)?$/i);
  if (single) {
    const vw = parseFloat(single[1]);
    return `${Number(((vw / 100) * viewportWidth).toFixed(2))}px /* @1920px viewport */`;
  }
  return input.replace(/(-?\d*\.?\d+)vw\b/gi, (_, n: string) => {
    const vw = parseFloat(n);
    return vw === 0 ? '0' : `${Number(((vw / 100) * viewportWidth).toFixed(2))}px`;
  });
}
