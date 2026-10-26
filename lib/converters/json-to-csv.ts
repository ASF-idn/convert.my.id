function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function convertJsonToCsv(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const arr = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  if (arr.length === 0) return '';
  const headers = Array.from(new Set(arr.flatMap((row) => Object.keys(row))));
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const row of arr) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(','));
  }
  return lines.join('\n');
}
