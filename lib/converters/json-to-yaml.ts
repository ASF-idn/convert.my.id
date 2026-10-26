function toYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    return /[:#\n]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const nested = toYaml(item, indent + 1).trimStart();
          return `${pad}- ${nested}`;
        }
        return `${pad}- ${toYaml(item, indent + 1)}`;
      })
      .join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
        }
        return `${pad}${k}: ${toYaml(v, indent)}`;
      })
      .join('\n');
  }
  return String(value);
}

export function convertJsonToYaml(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  return toYaml(parsed, 0);
}
