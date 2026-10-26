export function convertJsxToHtml(input: string): string {
  if (!input.trim()) return '';
  let html = input;
  html = html.replace(/\{\/\*([\s\S]*?)\*\/\}/g, '<!--$1-->');
  html = html.replace(/\bclassName=/g, 'class=');
  html = html.replace(/\bhtmlFor=/g, 'for=');
  html = html.replace(/\btabIndex=\{(\d+)\}/g, 'tabindex="$1"');
  html = html.replace(/\breadOnly\b/g, 'readonly');
  html = html.replace(/\bautoFocus\b/g, 'autofocus');
  html = html.replace(/\bmaxLength=\{(\d+)\}/g, 'maxlength="$1"');
  return html;
}
