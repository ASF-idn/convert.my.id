export function convertTomlToJson(input: string): string {
  if (!input.trim()) return '';
  const root: Record<string, unknown> = {};
  let activeSection: Record<string, unknown> = root;

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const secMatch = line.match(/^\[([^\]]+)\]$/);
    if (secMatch) {
      const parts = secMatch[1].split('.');
      let cursor = root;
      for (const p of parts) {
        if (typeof cursor[p] !== 'object' || cursor[p] === null) cursor[p] = {};
        cursor = cursor[p] as Record<string, unknown>;
      }
      activeSection = cursor;
      continue;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1) {
      const k = line.slice(0, eqIdx).trim();
      const rawV = line.slice(eqIdx + 1).trim();
      try {
        activeSection[k] = JSON.parse(rawV);
      } catch {
        activeSection[k] = rawV.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return JSON.stringify(root, null, 2);
}
