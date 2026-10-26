export function convertRustStructToJson(input: string): string {
  if (!input.trim()) return '';
  const out: Record<string, unknown> = {};
  let pendingRename: string | null = null;
  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    const ren = line.match(/#\[serde\(rename\s*=\s*"([^"]+)"\)\]/);
    if (ren) { pendingRename = ren[1]; continue; }
    const m = line.match(/^(?:pub\s+)?([A-Za-z0-9_]+)\s*:\s*([^,]+),?/);
    if (!m) continue;
    const key = pendingRename ?? m[1];
    pendingRename = null;
    const rType = m[2].trim();
    if (rType.startsWith('Vec<')) out[key] = ['sample'];
    else if (/i\d+|u\d+|isize|usize/.test(rType)) out[key] = 100;
    else if (/f32|f64/.test(rType)) out[key] = 1.0;
    else if (rType === 'bool') out[key] = true;
    else if (/String|str/.test(rType)) out[key] = key === 'domain' ? 'convert.my.id' : `sample_${key}`;
    else out[key] = null;
  }
  return JSON.stringify(out, null, 2);
}
