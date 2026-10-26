export function convertZodToTypescript(input: string): string {
  if (!input.trim()) return '';
  const lines = ['export interface InferredZodInterface {'];
  const fieldRegex = /^\s*([A-Za-z0-9_$]+)\s*:\s*z\.([A-Za-z0-9_.()]+),?/gm;
  let m: RegExpExecArray | null;
  while ((m = fieldRegex.exec(input)) !== null) {
    const key = m[1];
    const chain = m[2];
    const opt = chain.includes('.optional()') ? '?' : '';
    let tsType = 'unknown';
    if (chain.startsWith('array(')) {
      tsType = chain.includes('number') ? 'number[]' : chain.includes('boolean') ? 'boolean[]' : 'string[]';
    } else if (chain.startsWith('string')) tsType = 'string';
    else if (chain.startsWith('number')) tsType = 'number';
    else if (chain.startsWith('boolean')) tsType = 'boolean';
    else if (chain.startsWith('null')) tsType = 'null';
    lines.push(`  ${key}${opt}: ${tsType};`);
  }
  lines.push('}');
  return lines.join('\n');
}
