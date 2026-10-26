const ROMAN_PAIRS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function intToRoman(num: number): string {
  if (num < 1 || num > 3999 || !Number.isInteger(num)) {
    return `[Out of range 1..3999: ${num}]`;
  }
  let n = num;
  let out = '';
  for (const [val, sym] of ROMAN_PAIRS) {
    while (n >= val) { out += sym; n -= val; }
  }
  return out;
}

export function convertNumberToRoman(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (/^\d+$/.test(t)) return `${t} = ${intToRoman(Number(t))}`;
      return t;
    })
    .join('\n');
}
