function flattenToEnv(obj: Record<string, unknown>, prefix = ''): string[] {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const envKey = (prefix ? `${prefix}_${k}` : k)
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^A-Za-z0-9_]/g, '_')
      .toUpperCase();
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      lines.push(...flattenToEnv(v as Record<string, unknown>, envKey));
    } else {
      const strVal = typeof v === 'string' && /\s|#|=/.test(v) ? JSON.stringify(v) : String(v);
      lines.push(`${envKey}=${strVal}`);
    }
  }
  return lines;
}

export function convertJsonToEnv(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  return flattenToEnv(parsed).join('\n');
}
