const ACRONYMS = new Set(['json', 'xml', 'yaml', 'toml', 'html', 'css', 'scss', 'jsx', 'tsx', 'sql', 'csv', 'tsv', 'jwt', 'url', 'uri', 'rgb', 'rgba', 'hsl', 'cmyk', 'oklch', 'px', 'rem', 'em', 'vw', 'vh', 'pt', 'pc', 'png', 'jpg', 'webp', 'svg', 'bmp', 'gif', 'ico', 'mp4', 'mp3', 'wav', 'webm', 'flac', 'ogg', 'aac', 'm4a', 'mov', 'mkv', 'avi', 'obj', 'stl', 'ply', 'gltf', 'glb', '3d', 'ar', 'seo', 'api']);

export function convertSlugToTitle(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^\/convert\//, '')
        .split(/[-_/\s]+/)
        .filter(Boolean)
        .map((word, idx) => {
          const lower = word.toLowerCase();
          if (ACRONYMS.has(lower)) return lower.toUpperCase();
          if (idx > 0 && ['to', 'in', 'on', 'for', 'and', 'or', 'of'].includes(lower)) return lower;
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ')
    )
    .join('\n');
}
