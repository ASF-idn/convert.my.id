export function convertJsonToTsv(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const arr = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  if (arr.length === 0) return '';
  const headers = Array.from(new Set(arr.flatMap((r) => Object.keys(r))));
  const rows = arr.map((r) => headers.map((h) => String(r[h] ?? '').replace(/\t|\n/g, ' ')).join('\t'));
  return [headers.join('\t'), ...rows].join('\n');
}
