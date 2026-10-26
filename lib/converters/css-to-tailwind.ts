const EXACT_MAP: Record<string, string> = {
  'display: flex': 'flex',
  'display: inline-flex': 'inline-flex',
  'display: grid': 'grid',
  'display: block': 'block',
  'display: inline-block': 'inline-block',
  'display: none': 'hidden',
  'flex-direction: row': 'flex-row',
  'flex-direction: column': 'flex-col',
  'align-items: center': 'items-center',
  'align-items: flex-start': 'items-start',
  'align-items: flex-end': 'items-end',
  'justify-content: center': 'justify-center',
  'justify-content: space-between': 'justify-between',
  'justify-content: flex-start': 'justify-start',
  'position: relative': 'relative',
  'position: absolute': 'absolute',
  'position: fixed': 'fixed',
  'position: sticky': 'sticky',
  'font-weight: 700': 'font-bold',
  'font-weight: 600': 'font-semibold',
  'font-weight: 500': 'font-medium',
  'text-align: center': 'text-center',
  'text-align: right': 'text-right',
  'width: 100%': 'w-full',
  'height: 100%': 'h-full',
  'overflow: hidden': 'overflow-hidden',
  'cursor: pointer': 'cursor-pointer',
  'border-radius: 4px': 'rounded',
  'border-radius: 8px': 'rounded-lg',
  'border-radius: 12px': 'rounded-xl',
  'border-radius: 16px': 'rounded-2xl',
  'border-radius: 9999px': 'rounded-full',
};

function pxToTwScale(pxStr: string): string {
  const px = parseFloat(pxStr);
  const scale = px / 4;
  return Number.isInteger(scale) ? String(scale) : `[${px}px]`;
}

export function convertCssToTailwind(input: string): string {
  if (!input.trim()) return '';
  const classes: string[] = [];
  const clean = input.replace(/^[^{]*\{/, '').replace(/\}\s*$/, '');
  for (const raw of clean.split(';')) {
    const rule = raw.trim().toLowerCase().replace(/\s*:\s*/, ': ');
    if (!rule) continue;
    if (EXACT_MAP[rule]) {
      classes.push(EXACT_MAP[rule]);
      continue;
    }
    const m = rule.match(/^(padding|margin|gap|top|left|right|bottom|font-size):\s*(-?\d+\.?\d*)px$/);
    if (m) {
      const prop = m[1], val = m[2];
      const prefix: Record<string, string> = { padding: 'p', margin: 'm', gap: 'gap', top: 'top', left: 'left', right: 'right', bottom: 'bottom', 'font-size': 'text' };
      classes.push(prop === 'font-size' ? `text-[${val}px]` : `${prefix[prop]}-${pxToTwScale(val)}`);
      continue;
    }
    const [k, v] = rule.split(': ');
    if (k && v) classes.push(`[${k}:${v.replace(/\s+/g, '_')}]`);
  }
  return classes.join(' ');
}
