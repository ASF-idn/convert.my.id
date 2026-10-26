function hexToRgbString(hexRaw: string): string {
  const hex = hexRaw.replace(/^#/, '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(2));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  throw new Error(`Invalid HEX color: #${hex}`);
}

export function convertHexToRgb(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (m) => hexToRgbString(m));
}
