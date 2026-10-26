function inferSqlType(val: unknown): string {
  if (typeof val === 'boolean') return 'BOOLEAN';
  if (typeof val === 'number') return Number.isInteger(val) ? 'BIGINT' : 'DECIMAL(18, 4)';
  if (typeof val === 'object' && val !== null) return 'JSONB';
  return 'VARCHAR(255)';
}

function formatSqlVal(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function convertJsonToSqlTable(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const rows = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  if (rows.length === 0 || typeof rows[0] !== 'object' || rows[0] === null) {
    return '-- Provide a JSON object or array of objects';
  }
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const colDefs = cols.map((c) => {
    const sample = rows.find((r) => r[c] !== null && r[c] !== undefined)?.[c];
    const pk = c.toLowerCase() === 'id' ? ' PRIMARY KEY' : '';
    return `  ${c} ${inferSqlType(sample)}${pk}`;
  });

  const ddl = `CREATE TABLE exported_records (\n${colDefs.join(',\n')}\n);`;
  const inserts = rows.map((r) => {
    const vals = cols.map((c) => formatSqlVal(r[c])).join(', ');
    return `INSERT INTO exported_records (${cols.join(', ')}) VALUES (${vals});`;
  });

  return `${ddl}\n\n${inserts.join('\n')}`;
}
