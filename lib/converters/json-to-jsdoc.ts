export function convertJsonToJsdoc(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return '/** @typedef {any} RootPayload */';
  }
  const lines = ['/**', ' * @typedef {Object} RootPayload'];
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    const t = v === null ? 'null' : Array.isArray(v) ? 'Array<any>' : typeof v;
    lines.push(` * @property {${t}} ${k}`);
  }
  lines.push(' */');
  return lines.join('\n');
}
