function inferSchema(val: unknown): Record<string, unknown> {
  if (val === null) return { type: 'null' };
  if (Array.isArray(val)) {
    return {
      type: 'array',
      items: val.length > 0 ? inferSchema(val[0]) : {},
    };
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    const properties: Record<string, unknown> = {};
    const required = Object.keys(obj);
    for (const [k, v] of Object.entries(obj)) {
      properties[k] = inferSchema(v);
    }
    return { type: 'object', properties, required };
  }
  if (typeof val === 'number') {
    return { type: Number.isInteger(val) ? 'integer' : 'number' };
  }
  return { type: typeof val };
}

export function convertJsonToJsonSchema(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GeneratedSchema',
    ...inferSchema(parsed),
  };
  return JSON.stringify(schema, null, 2);
}
