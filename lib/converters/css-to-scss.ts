export function convertCssToScss(input: string): string {
  if (!input.trim()) return '';
  const colorMap = new Map<string, string>();
  let idx = 1;
  const scssBody = input.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (hex) => {
    const lower = hex.toLowerCase();
    if (!colorMap.has(lower)) {
      colorMap.set(lower, `$color-brand-${idx++}`);
    }
    return colorMap.get(lower)!;
  });

  const varLines = Array.from(colorMap.entries()).map(([hex, varName]) => `${varName}: ${hex};`);
  return [...varLines, '', scssBody.trim()].join('\n');
}
