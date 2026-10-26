function inferZod(val: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (val === null) return 'z.null()';
  if (typeof val === 'string') {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'z.string().email()';
    if (/^https?:\/\//.test(val)) return 'z.string().url()';
    return 'z.string()';
  }
  if (typeof val === 'number') return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
  if (typeof val === 'boolean') return 'z.boolean()';
  if (Array.isArray(val)) {
    if (val.length === 0) return 'z.array(z.unknown())';
    return `z.array(${inferZod(val[0], indent)})`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return 'z.record(z.string(), z.unknown())';
    const lines = entries.map(([k, v]) => `${pad}  ${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)}: ${inferZod(v, indent + 1)},`);
    return `z.object({\n${lines.join('\n')}\n${pad}})`;
  }
  return 'z.unknown()';
}

export function convertJsonToZod(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  return `import { z } from 'zod';\n\nexport const schema = ${inferZod(parsed, 0)};\n\nexport type SchemaInput = z.infer<typeof schema>;`;
}
