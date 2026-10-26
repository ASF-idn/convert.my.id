function toHexByte(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

export function convertRgbaToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)/gi,
    (_, r, g, b, a) => {
      const alpha = a !== undefined ? parseFloat(a) : 1;
      const aHex = alpha < 1 ? toHexByte(alpha * 255) : '';
      return `#${toHexByte(Number(r))}${toHexByte(Number(g))}${toHexByte(Number(b))}${aHex}`;
    }
  );
}
