export function convertTsvToJson(input: string): string {
  const lines = input.trim().replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  if (lines.length === 0) return '[]';
  const headers = lines[0].split('\t').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = line.split('\t');
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const v = (cols[idx] ?? '').trim();
      obj[h] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v;
    });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}
