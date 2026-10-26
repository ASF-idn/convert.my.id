export function convertCurlToFetch(input: string): string {
  if (!input.trim()) return '';
  const clean = input.replace(/\\\r?\n/g, ' ').trim();
  const urlMatch = clean.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/);
  const url = urlMatch ? urlMatch[1] : 'https://convert.my.id';

  const methodMatch = clean.match(/(?:-X|--request)\s+([A-Z]+)/i);
  const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+(['"])([\s\S]*?)\1/);
  const method = methodMatch ? methodMatch[1].toUpperCase() : dataMatch ? 'POST' : 'GET';

  const headers: Record<string, string> = {};
  const headerRegex = /(?:-H|--header)\s+(['"])([^'"]+)\1/g;
  let hm: RegExpExecArray | null;
  while ((hm = headerRegex.exec(clean)) !== null) {
    const idx = hm[2].indexOf(':');
    if (idx !== -1) {
      headers[hm[2].slice(0, idx).trim()] = hm[2].slice(idx + 1).trim();
    }
  }

  const options: Record<string, unknown> = { method };
  if (Object.keys(headers).length > 0) options.headers = headers;
  if (dataMatch) options.body = dataMatch[2];

  return [
    `const response = await fetch(${JSON.stringify(url)}, ${JSON.stringify(options, null, 2)});`,
    'const data = await response.json();',
    'console.log(data);',
  ].join('\n');
}
