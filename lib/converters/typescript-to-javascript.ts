export function convertTypescriptToJavascript(input: string): string {
  if (!input.trim()) return '';
  let out = input;
  // Remove interface and type alias blocks
  out = out.replace(/^\s*(?:export\s+)?interface\s+[A-Za-z0-9_$<>\s,]+\{[\s\S]*?^\}/gm, '');
  out = out.replace(/^\s*(?:export\s+)?type\s+[A-Za-z0-9_$<>]+\s*=[^;]+;/gm, '');
  // Remove import type statements
  out = out.replace(/^\s*import\s+type\s+[^;]+;\s*$/gm, '');
  // Remove access modifiers and readonly
  out = out.replace(/\b(public|private|protected|readonly)\s+/g, '');
  // Remove generic type parameters on functions
  out = out.replace(/function(\s+[A-Za-z0-9_$]+)\s*<[^>]+>\s*\(/g, 'function$1(');
  // Remove return type annotations before { or =>
  out = out.replace(/\)\s*:\s*[A-Za-z0-9_$<>\[\]|&\s]+(?=\s*(?:\{|=>))/g, ')');
  // Remove variable and parameter type annotations
  out = out.replace(/([A-Za-z0-9_$?]+)\s*:\s*[A-Za-z0-9_$<>\[\]|&]+(?=\s*[,)=;])/g, (_m, id) => id.replace(/\?$/, ''));
  // Remove "as Type" assertions
  out = out.replace(/\s+as\s+[A-Za-z0-9_$<>\[\]|&]+/g, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
}
