function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function convertCsvToHtmlTable(input: string): string {
  const lines = input.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return '';
  const rows = lines.map((l) => l.split(',').map((c) => esc(c.trim().replace(/^"|"$/g, ''))));
  const headCells = rows[0].map((h) => `      <th>${h}</th>`).join('\n');
  const bodyRows = rows
    .slice(1)
    .map((r) => `    <tr>\n${r.map((c) => `      <td>${c}</td>`).join('\n')}\n    </tr>`)
    .join('\n');
  return `<table>\n  <thead>\n    <tr>\n${headCells}\n    </tr>\n  </thead>\n  <tbody>\n${bodyRows}\n  </tbody>\n</table>`;
}
