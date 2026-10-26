export function convertCssToJsStyles(input: string): string {
  if (!input.trim()) return '';
  const clean = input.replace(/^[^{]*\{/, '').replace(/\}\s*$/, '');
  const styleObj: Record<string, string | number> = {};
  for (const decl of clean.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const rawProp = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!rawProp || !val) continue;
    const camel = rawProp.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    styleObj[camel] = /^-?\d+(\.\d+)?$/.test(val) ? Number(val) : val;
  }
  return `const styles: React.CSSProperties = ${JSON.stringify(styleObj, null, 2)};`;
}
