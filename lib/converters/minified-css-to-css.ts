export function convertMinifiedCssToCss(input: string): string {
  if (!input.trim()) return '';
  return input
    .replace(/\s*\{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/\s*\}\s*/g, '\n}\n\n')
    .replace(/\n  \n\}/g, '\n}')
    .trim();
}
