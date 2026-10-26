const ROMAN_VAL: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

function romanToInt(roman: string): number {
  const s = roman.toUpperCase().trim();
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = ROMAN_VAL[s[i]] ?? 0;
    const next = ROMAN_VAL[s[i + 1]] ?? 0;
    if (curr < next) total -= curr;
    else total += curr;
  }
  return total;
}

export function convertRomanToNumber(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return '';
      return `${t.toUpperCase()} = ${romanToInt(t)}`;
    })
    .join('\n');
}
