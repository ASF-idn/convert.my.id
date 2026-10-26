function toSnake(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();
}
function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Item';
}

export function convertJsonToRustStruct(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const structs: string[] = [];

  function inferRust(key: string, val: unknown): string {
    if (val === null || val === undefined) return 'Option<serde_json::Value>';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'i64' : 'f64';
    if (typeof val === 'string') return 'String';
    if (Array.isArray(val)) return val.length ? `Vec<${inferRust(key, val[0])}>` : 'Vec<serde_json::Value>';
    if (typeof val === 'object') {
      const child = toPascal(key);
      buildStruct(child, val as Record<string, unknown>);
      return child;
    }
    return 'serde_json::Value';
  }

  function buildStruct(name: string, obj: Record<string, unknown>): void {
    const lines = ['#[derive(Debug, Clone, Serialize, Deserialize)]', `pub struct ${name} {`];
    for (const [k, v] of Object.entries(obj)) {
      const snake = toSnake(k);
      if (snake !== k) lines.push(`    #[serde(rename = "${k}")]`);
      lines.push(`    pub ${snake}: ${inferRust(k, v)},`);
    }
    lines.push('}');
    structs.push(lines.join('\n'));
  }

  const root = (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : { data: parsed }) as Record<string, unknown>;
  buildStruct('RootStruct', root);
  return `use serde::{Deserialize, Serialize};\n\n${structs.reverse().join('\n\n')}`;
}
