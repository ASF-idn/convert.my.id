export function convertHexToRgba(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (_, raw: string) => {
    const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(2)) : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  });
}
