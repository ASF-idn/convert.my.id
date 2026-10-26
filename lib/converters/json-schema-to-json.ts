function instantiateSchema(schema: Record<string, unknown>, keyHint = ''): unknown {
  const t = schema.type;
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];
  if (t === 'string') return keyHint.toLowerCase().includes('domain') ? 'convert.my.id' : `sample_${keyHint || 'str'}`;
  if (t === 'integer' || t === 'number') return 100;
  if (t === 'boolean') return true;
  if (t === 'array') {
    const items = (schema.items as Record<string, unknown>) ?? { type: 'string' };
    return [instantiateSchema(items, keyHint)];
  }
  if (t === 'object' || schema.properties) {
    const props = (schema.properties as Record<string, Record<string, unknown>>) ?? {};
    const obj: Record<string, unknown> = {};
    for (const [k, sub] of Object.entries(props)) {
      obj[k] = instantiateSchema(sub, k);
    }
    return obj;
  }
  return null;
}

export function convertJsonSchemaToJson(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  return JSON.stringify(instantiateSchema(parsed), null, 2);
}
