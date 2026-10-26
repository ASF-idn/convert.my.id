export function convertJsonToToml(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  const scalars: string[] = [];
  const tables: string[] = [];

  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const secLines = [`[${k}]`];
      for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
        secLines.push(`${sk} = ${JSON.stringify(sv)}`);
      }
      tables.push(secLines.join('\n'));
    } else {
      scalars.push(`${k} = ${JSON.stringify(v)}`);
    }
  }
  return [...scalars, ...tables].join('\n\n');
}
