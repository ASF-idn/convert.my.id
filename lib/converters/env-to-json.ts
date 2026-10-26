export function convertEnvToJson(input: string): string {
  if (!input.trim()) return '';
  const result: Record<string, string | number | boolean> = {};
  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim().replace(/^export\s+/, '');
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === 'true') result[key] = true;
    else if (val === 'false') result[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) result[key] = Number(val);
    else result[key] = val;
  }
  return JSON.stringify(result, null, 2);
}
