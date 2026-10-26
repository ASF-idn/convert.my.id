function clampByte(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

export function convertRgbToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)/gi,
    (_, r, g, b, a) => {
      const hex = '#' + clampByte(Number(r)) + clampByte(Number(g)) + clampByte(Number(b));
      if (a !== undefined) {
        const alpha = clampByte(parseFloat(a) * 255);
        return hex + alpha;
      }
      return hex;
    }
  );
}
