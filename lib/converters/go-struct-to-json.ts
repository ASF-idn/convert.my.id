export function convertGoStructToJson(input: string): string {
  if (!input.trim()) return '';
  const out: Record<string, unknown> = {};
  const lines = input.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('//') || line.startsWith('type ') || line === '}') continue;
    const m = line.match(/^([A-Za-z0-9_]+)\s+([\[\]A-Za-z0-9_{}]+)(?:\s+`json:"([^",]+).*?"`)?/);
    if (!m) continue;
    const key = m[3] || m[1];
    const goType = m[2];
    if (goType.startsWith('[]')) out[key] = [];
    else if (/int|uint/i.test(goType)) out[key] = 1;
    else if (/float/i.test(goType)) out[key] = 99.9;
    else if (/bool/i.test(goType)) out[key] = true;
    else if (/string/i.test(goType)) out[key] = key.includes('domain') ? 'convert.my.id' : `sample_${key}`;
    else out[key] = {};
  }
  return JSON.stringify(out, null, 2);
}
