export function convertHtmlTableToCsv(input: string): string {
  if (!input.trim()) return '';
  const rowMatches = input.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  if (!rowMatches) return '';
  return rowMatches
    .map((rowHtml) => {
      const cells = rowHtml.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) ?? [];
      return cells
        .map((cell) => {
          const text = cell.replace(/<[^>]+>/g, '').trim();
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(',');
    })
    .join('\n');
}
