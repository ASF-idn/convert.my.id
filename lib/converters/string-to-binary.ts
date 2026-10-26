export function convertStringToBinary(input: string): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}
