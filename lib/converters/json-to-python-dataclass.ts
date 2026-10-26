function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Item';
}

export function convertJsonToPythonDataclass(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const classes: string[] = [];

  function inferPy(key: string, val: unknown): string {
    if (val === null || val === undefined) return 'Optional[Any]';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'string') return 'str';
    if (Array.isArray(val)) return val.length ? `List[${inferPy(key, val[0])}]` : 'List[Any]';
    if (typeof val === 'object') {
      const clsName = toPascal(key);
      buildClass(clsName, val as Record<string, unknown>);
      return clsName;
    }
    return 'Any';
  }

  function buildClass(name: string, obj: Record<string, unknown>): void {
    const entries = Object.entries(obj);
    const lines = ['@dataclass', `class ${name}:`];
    if (entries.length === 0) {
      lines.push('    pass');
    } else {
      for (const [k, v] of entries) {
        const safeKey = k.replace(/[^A-Za-z0-9_]/g, '_');
        lines.push(`    ${safeKey}: ${inferPy(k, v)}`);
      }
    }
    classes.push(lines.join('\n'));
  }

  const root = (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : { items: parsed }) as Record<string, unknown>;
  buildClass('RootModel', root);
  return `from dataclasses import dataclass\nfrom typing import Any, List, Optional\n\n\n${classes.join('\n\n\n')}`;
}
