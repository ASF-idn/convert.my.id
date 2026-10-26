export function convertScssToCss(input: string): string {
  if (!input.trim()) return '';
  const vars = new Map<string, string>();
  let body = input.replace(/^\s*\$([A-Za-z0-9_-]+)\s*:\s*([^;]+);/gm, (_, name: string, val: string) => {
    vars.set(name, val.trim());
    return '';
  });
  // Strip single-line comments
  body = body.replace(/\/\/.*$/gm, '');
  // Substitute $variables
  vars.forEach((val, name) => {
    body = body.replace(new RegExp('\\$' + name + '\\b', 'g'), val);
  });
  return body.trim();
}
