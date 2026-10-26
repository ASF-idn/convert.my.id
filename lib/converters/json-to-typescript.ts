import type { TextConversionOptions } from '@/types/converter';

function isValidId(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function toPascal(str: string): string {
  const clean = str.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return clean ? (/^[0-9]/.test(clean) ? 'I' + clean : clean) : 'GeneratedItem';
}

export function convertJsonToTypescript(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '// Paste JSON to generate TypeScript interfaces';
  const parsed: unknown = JSON.parse(trimmed);
  const rootName = toPascal(options.rootInterfaceName || 'RootInterface');
  const exportKw = options.exportInterfaces !== false ? 'export ' : '';
  const optFlag = options.optionalFields ? '?' : '';
  const interfaces = new Map<string, string>();
  const used = new Set<string>();

  function uniqueName(hint: string): string {
    const base = toPascal(hint);
    if (!used.has(base)) { used.add(base); return base; }
    let i = 2;
    while (used.has(base + i)) i++;
    used.add(base + i);
    return base + i;
  }

  function infer(val: unknown, hint: string): string {
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const types = Array.from(new Set(val.map((item) => infer(item, hint.replace(/s$/, '') || 'Item'))));
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
    }
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (Object.keys(obj).length === 0) return 'Record<string, unknown>';
      const name = uniqueName(hint);
      build(obj, name);
      return name;
    }
    return typeof val;
  }

  function build(obj: Record<string, unknown>, name: string): void {
    const lines = [`${exportKw}interface ${name} {`];
    for (const [k, v] of Object.entries(obj)) {
      const prop = isValidId(k) ? k : `'${k.replace(/'/g, "\\'")}'`;
      lines.push(`  ${prop}${optFlag}: ${infer(v, k)};`);
    }
    lines.push('}');
    interfaces.set(name, lines.join('\n'));
  }

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    used.add(rootName);
    build(parsed as Record<string, unknown>, rootName);
  } else {
    interfaces.set(rootName, `${exportKw}type ${rootName} = ${infer(parsed, rootName)};`);
  }

  return Array.from(interfaces.values()).join('\n\n');
}
