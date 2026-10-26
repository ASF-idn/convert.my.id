function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toXmlNodes(val: unknown, tagName: string, indent = 0): string {
  const pad = '  '.repeat(indent);
  const safeTag = tagName.replace(/[^A-Za-z0-9_.-]/g, '_') || 'item';
  if (val === null || val === undefined) return `${pad}<${safeTag} />`;
  if (typeof val !== 'object') {
    return `${pad}<${safeTag}>${escapeXml(String(val))}</${safeTag}>`;
  }
  if (Array.isArray(val)) {
    return val.map((item) => toXmlNodes(item, safeTag, indent)).join('\n');
  }
  const entries = Object.entries(val as Record<string, unknown>);
  const children = entries.map(([k, v]) => toXmlNodes(v, k, indent + 1)).join('\n');
  return `${pad}<${safeTag}>\n${children}\n${pad}</${safeTag}>`;
}

export function convertJsonToXml(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const body =
    typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && Object.keys(parsed).length === 1
      ? Object.entries(parsed as Record<string, unknown>).map(([k, v]) => toXmlNodes(v, k, 0)).join('\n')
      : toXmlNodes(parsed, 'root', 0);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
}
