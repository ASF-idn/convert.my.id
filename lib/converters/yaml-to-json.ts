function parseScalar(val: string): unknown {
  const s = val.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

export function convertYamlToJson(input: string): string {
  if (!input.trim()) return '';
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const root: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentObj: Record<string, unknown> | null = null;

  for (const rawLine of lines) {
    const cleaned = rawLine.replace(/\s+#.*$/, '');
    if (!cleaned.trim() || cleaned.trim() === '---') continue;
    const indent = cleaned.search(/\S/);
    const trimmed = cleaned.trim();

    if (trimmed.startsWith('- ')) {
      const itemVal = parseScalar(trimmed.slice(2));
      if (currentKey) {
        if (!Array.isArray(root[currentKey])) root[currentKey] = [];
        (root[currentKey] as unknown[]).push(itemVal);
      }
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();
      if (indent === 0) {
        currentKey = key;
        currentObj = null;
        root[key] = rest === '' ? {} : parseScalar(rest);
      } else if (currentKey) {
        if (typeof root[currentKey] !== 'object' || root[currentKey] === null || Array.isArray(root[currentKey])) {
          root[currentKey] = {};
        }
        currentObj = root[currentKey] as Record<string, unknown>;
        currentObj[key] = rest === '' ? null : parseScalar(rest);
      }
    }
  }
  return JSON.stringify(root, null, 2);
}
