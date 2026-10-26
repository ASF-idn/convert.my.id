function splitSqlValues(raw: string): unknown[] {
  const result: unknown[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && raw[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      result.push(parseSqlToken(current.trim()));
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(parseSqlToken(current.trim()));
  return result;
}

function parseSqlToken(tok: string): unknown {
  if (/^null$/i.test(tok)) return null;
  if (/^true$/i.test(tok)) return true;
  if (/^false$/i.test(tok)) return false;
  if (/^-?\d+(\.\d+)?$/.test(tok)) return Number(tok);
  if (tok.startsWith("'") && tok.endsWith("'")) return tok.slice(1, -1).replace(/''/g, "'");
  return tok;
}

export function convertSqlToJson(input: string): string {
  if (!input.trim()) return '';
  const regex = /INSERT\s+INTO\s+[\w."`\[\]]+\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi;
  const output: Record<string, unknown>[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const cols = match[1].split(',').map((c) => c.trim().replace(/^["`\[]|["`\]]$/g, ''));
    const vals = splitSqlValues(match[2]);
    const row: Record<string, unknown> = {};
    cols.forEach((col, idx) => {
      row[col] = vals[idx] ?? null;
    });
    output.push(row);
  }
  return JSON.stringify(output, null, 2);
}
