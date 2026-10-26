export function convertPxToVh(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const viewportHeight = 1080;
  const single = trimmed.match(/^(-?\d*\.?\d+)\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    return `${Number(((px / viewportHeight) * 100).toFixed(4))}vh /* @1080px height */`;
  }
  return input.replace(/(-?\d*\.?\d+)px\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    return px === 0 ? '0' : `${Number(((px / viewportHeight) * 100).toFixed(4))}vh`;
  });
}
