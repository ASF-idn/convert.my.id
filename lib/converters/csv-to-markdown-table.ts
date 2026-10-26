export function convertCsvToMarkdownTable(input: string): string {
  const lines = input.trim().replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  if (lines.length === 0) return '';
  const matrix = lines.map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
  const headers = matrix[0];
  const sep = headers.map(() => '---');
  const fmt = (row: string[]) => `| ${row.join(' | ')} |`;
  return [fmt(headers), fmt(sep), ...matrix.slice(1).map(fmt)].join('\n');
}
