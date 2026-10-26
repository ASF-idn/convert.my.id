export function convertPxToVw(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const viewportWidth = 1920;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    return `${Number(((px / viewportWidth) * 100).toFixed(4))}vw /* @1920px viewport */`;
  }
  return input.replace(/(-?\d*\.?\d+)px\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    return px === 0 ? '0' : `${Number(((px / viewportWidth) * 100).toFixed(4))}vw`;
  });
}
