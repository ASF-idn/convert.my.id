const TW_TO_CSS: Record<string, string> = {
  flex: 'display: flex;',
  'inline-flex': 'display: inline-flex;',
  grid: 'display: grid;',
  block: 'display: block;',
  'inline-block': 'display: inline-block;',
  hidden: 'display: none;',
  'flex-row': 'flex-direction: row;',
  'flex-col': 'flex-direction: column;',
  'items-center': 'align-items: center;',
  'items-start': 'align-items: flex-start;',
  'items-end': 'align-items: flex-end;',
  'justify-center': 'justify-content: center;',
  'justify-between': 'justify-content: space-between;',
  'justify-start': 'justify-content: flex-start;',
  relative: 'position: relative;',
  absolute: 'position: absolute;',
  fixed: 'position: fixed;',
  sticky: 'position: sticky;',
  'font-bold': 'font-weight: 700;',
  'font-semibold': 'font-weight: 600;',
  'font-medium': 'font-weight: 500;',
  'text-center': 'text-align: center;',
  'w-full': 'width: 100%;',
  'h-full': 'height: 100%;',
  'overflow-hidden': 'overflow: hidden;',
  'cursor-pointer': 'cursor: pointer;',
  rounded: 'border-radius: 4px;',
  'rounded-lg': 'border-radius: 8px;',
  'rounded-xl': 'border-radius: 12px;',
  'rounded-2xl': 'border-radius: 16px;',
  'rounded-full': 'border-radius: 9999px;',
};

export function convertTailwindToCss(input: string): string {
  if (!input.trim()) return '';
  const tokens = input.trim().replace(/^class(?:Name)?=["']|["']$/g, '').split(/\s+/);
  const rules: string[] = [];
  for (const tok of tokens) {
    if (TW_TO_CSS[tok]) {
      rules.push(`  ${TW_TO_CSS[tok]}`);
      continue;
    }
    const spacing = tok.match(/^(p|m|gap)-(\d+(?:\.\d+)?)$/);
    if (spacing) {
      const prop = spacing[1] === 'p' ? 'padding' : spacing[1] === 'm' ? 'margin' : 'gap';
      const px = parseFloat(spacing[2]) * 4;
      rules.push(`  ${prop}: ${px}px;`);
    }
  }
  return `.converted-element {\n${rules.join('\n')}\n}`;
}
