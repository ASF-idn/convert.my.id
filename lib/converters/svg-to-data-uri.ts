export function convertSvgToDataUri(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const minified = trimmed
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  const encoded = minified
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
  const dataUri = `data:image/svg+xml,${encoded}`;
  return [
    '/* 1. Raw Data URI */',
    dataUri,
    '',
    '/* 2. Ready-to-Use CSS Background Rule */',
    `.svg-icon {\n  background-image: url("${dataUri}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`,
  ].join('\n');
}
