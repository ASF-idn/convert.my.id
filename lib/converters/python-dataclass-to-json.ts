export function convertPythonDataclassToJson(input: string): string {
  if (!input.trim()) return '';
  const out: Record<string, unknown> = {};
  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('@') || line.startsWith('class ') || line.startsWith('from ') || line === 'pass') continue;
    const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*([^=\n]+)(?:=\s*(.+))?$/);
    if (!m) continue;
    const key = m[1];
    const pyType = m[2].trim();
    if (pyType.startsWith('List') || pyType.startsWith('list')) out[key] = ['item'];
    else if (pyType === 'int') out[key] = 1;
    else if (pyType === 'float') out[key] = 1.5;
    else if (pyType === 'bool') out[key] = true;
    else if (pyType === 'str') out[key] = key === 'domain' ? 'convert.my.id' : `sample_${key}`;
    else out[key] = null;
  }
  return JSON.stringify(out, null, 2);
}
