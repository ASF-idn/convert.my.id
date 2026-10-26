function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function convertCsvToJson(input: string): string {
  const lines = input.trim().replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  if (lines.length === 0) return '[]';
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const raw = (vals[idx] ?? '').trim();
      if (raw === 'true') obj[h] = true;
      else if (raw === 'false') obj[h] = false;
      else if (/^-?\d+(\.\d+)?$/.test(raw)) obj[h] = Number(raw);
      else obj[h] = raw;
    });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}
