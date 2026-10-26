function cssStyleToJsxObject(styleStr: string): string {
  const props = styleStr
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':');
      if (idx === -1) return '';
      const prop = decl
        .slice(0, idx)
        .trim()
        .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const val = decl.slice(idx + 1).trim();
      const formattedVal = /^-?\d+(\.\d+)?$/.test(val) ? val : JSON.stringify(val);
      return `${prop}: ${formattedVal}`;
    })
    .filter(Boolean);
  return `{{ ${props.join(', ')} }}`;
}

export function convertHtmlToJsx(input: string): string {
  if (!input.trim()) return '';
  let jsx = input;
  // Convert HTML comments to JSX comments
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, (m) => `{/* ${m.slice(4, -3).trim()} */}`);
  // Convert attributes
  jsx = jsx.replace(/\bclass=/g, 'className=');
  jsx = jsx.replace(/\bfor=/g, 'htmlFor=');
  jsx = jsx.replace(/\btabindex=/gi, 'tabIndex=');
  jsx = jsx.replace(/\breadonly\b/gi, 'readOnly');
  jsx = jsx.replace(/\bmaxlength=/gi, 'maxLength=');
  jsx = jsx.replace(/\bautocomplete=/gi, 'autoComplete=');
  jsx = jsx.replace(/\bautofocus\b/gi, 'autoFocus');
  // Convert inline style="..."
  jsx = jsx.replace(/style="([^"]*)"/g, (_, s: string) => `style=${cssStyleToJsxObject(s)}`);
  // Self-close void HTML elements
  jsx = jsx.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*?)(?<!\/)>/gi, '<$1$2 />');
  return jsx;
}
