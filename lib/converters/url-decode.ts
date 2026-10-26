export function convertUrlDecode(input: string): string {
  if (!input) return '';
  return decodeURIComponent(input.replace(/\+/g, '%20'));
}
