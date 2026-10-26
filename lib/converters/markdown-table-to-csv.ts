export function convertMarkdownTableToCsv(input: string): string {
  const lines = input
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && !/^\|[\s|:-]+\|$/.test(l));
  return lines
    .map((line) =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => {
          const c = cell.trim();
          return /[",]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c;
        })
        .join(',')
    )
    .join('\n');
}
