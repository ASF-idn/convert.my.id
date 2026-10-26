export function convertJsStylesToCss(input: string): string {
  if (!input.trim()) return '';
  let raw = input.trim().replace(/^[^{]*=/, '').replace(/;$/, '').trim();
  raw = raw.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\s*\}/g, '}');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const lines = Object.entries(parsed).map(([k, v]) => {
    const kebab = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return `  ${kebab}: ${v};`;
  });
  return `.element {\n${lines.join('\n')}\n}`;
}
