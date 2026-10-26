export function convertHtmlEntityEncode(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/[^\x00-\x7F]/g, (ch) => `&#${ch.codePointAt(0)};`);
}
