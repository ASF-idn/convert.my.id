function linearToSrgb(x: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function oklchToHexStr(Lraw: number, isPct: boolean, C: number, Hdeg: number): string {
  const L = isPct ? Lraw / 100 : Lraw;
  const hRad = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toHex = (v: number) => Math.round(linearToSrgb(v) * 255).toString(16).padStart(2, '0');
  return `#${toHex(rLin)}${toHex(gLin)}${toHex(bLin)}`;
}

export function convertOklchToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /oklch\(\s*([0-9.]+)(%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)/gi,
    (_, lStr, pct, cStr, hStr) =>
      oklchToHexStr(parseFloat(lStr), pct === '%', parseFloat(cStr), parseFloat(hStr))
  );
}
