export function convertTypescriptToJson(input: string): string {
  if (!input.trim()) return '';
  const result: Record<string, unknown> = {};
  const propRegex = /^\s*['"]?([A-Za-z0-9_$-]+)['"]?\??\s*:\s*([^;\n]+);?/gm;
  let m: RegExpExecArray | null;
  while ((m = propRegex.exec(input)) !== null) {
    const key = m[1];
    const rawType = m[2].trim();
    if (key === 'interface' || key === 'export') continue;
    if (rawType.endsWith('[]') || rawType.startsWith('Array<')) {
      result[key] = rawType.includes('number') ? [1, 2] : rawType.includes('boolean') ? [true] : ['sample_item'];
    } else if (/string/i.test(rawType)) {
      result[key] = key.toLowerCase().includes('domain') ? 'convert.my.id' : `sample_${key}`;
    } else if (/number|int|float/i.test(rawType)) {
      result[key] = 100;
    } else if (/boolean|bool/i.test(rawType)) {
      result[key] = true;
    } else if (/null/i.test(rawType)) {
      result[key] = null;
    } else {
      result[key] = {};
    }
  }
  return JSON.stringify(result, null, 2);
}
