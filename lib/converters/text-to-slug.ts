export function convertTextToSlug(input: string): string {
  if (!input.trim()) return '';
  const words = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const lower = words.map((w) => w.toLowerCase());
  const kebab = lower.join('-');
  const snake = lower.join('_');
  const constant = lower.join('_').toUpperCase();
  const pascal = lower.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const camel = pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';

  return [
    `SEO URL Slug (kebab-case) : ${kebab}`,
    `camelCase                 : ${camel}`,
    `PascalCase                : ${pascal}`,
    `snake_case                : ${snake}`,
    `CONSTANT_CASE             : ${constant}`,
  ].join('\n');
}
