function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'RootType';
}

export function convertJsonToGraphql(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const blocks: string[] = [];

  function resolveScalar(key: string, val: unknown): string {
    if (val === null || val === undefined) return 'String';
    if (typeof val === 'boolean') return 'Boolean!';
    if (typeof val === 'number') return Number.isInteger(val) ? 'Int!' : 'Float!';
    if (typeof val === 'string') return key.toLowerCase() === 'id' ? 'ID!' : 'String!';
    if (Array.isArray(val)) {
      if (val.length === 0) return '[String]!';
      return `[${resolveScalar(key, val[0]).replace(/!$/, '')}!]!`;
    }
    if (typeof val === 'object') {
      const childName = toPascal(key);
      buildType(childName, val as Record<string, unknown>);
      return `${childName}!`;
    }
    return 'String';
  }

  function buildType(typeName: string, obj: Record<string, unknown>): void {
    const fields = Object.entries(obj).map(([k, v]) => `  ${k.replace(/[^A-Za-z0-9_]/g, '_')}: ${resolveScalar(k, v)}`);
    blocks.push(`type ${typeName} {\n${fields.join('\n')}\n}`);
  }

  const rootObj = Array.isArray(parsed) ? (parsed[0] as Record<string, unknown>) ?? {} : (parsed as Record<string, unknown>);
  buildType('RootType', rootObj);
  return blocks.reverse().join('\n\n');
}
