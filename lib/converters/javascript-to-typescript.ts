export function convertJavascriptToTypescript(input: string): string {
  if (!input.trim()) return '';
  let out = input;
  // Annotate string variable declarations
  out = out.replace(/\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(['"`])/g, '$1 $2: string = $3');
  // Annotate numeric variable declarations
  out = out.replace(/\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(-?\d+(?:\.\d+)?)\b/g, '$1 $2: number = $3');
  // Annotate boolean variable declarations
  out = out.replace(/\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(true|false)\b/g, '$1 $2: boolean = $3');
  // Annotate default numeric parameters in functions
  out = out.replace(/([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(-?\d+(?:\.\d+)?)/g, '$1: number = $2');
  // Annotate default string parameters in functions
  out = out.replace(/([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(['"][^'"]*['"])/g, '$1: string = $2');
  return out;
}
