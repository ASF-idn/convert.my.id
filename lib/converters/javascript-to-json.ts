export function convertJavascriptToJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  let s = trimmed.replace(/^const\s+\w+\s*=\s*/, '').replace(/;$/, '');
  // Remove single-line and multi-line comments
  s = s.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  // Convert single-quoted strings to double-quoted strings
  s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, inner: string) => JSON.stringify(inner));
  // Quote unquoted object keys
  s = s.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":');
  // Strip trailing commas
  s = s.replace(/,\s*([}\]])/g, '$1');
  const parsed: unknown = JSON.parse(s);
  return JSON.stringify(parsed, null, 2);
}
