function xmlNodeToJson(node: Element): unknown {
  const obj: Record<string, unknown> = {};
  if (node.attributes && node.attributes.length > 0) {
    const attrs: Record<string, string> = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      attrs[attr.name] = attr.value;
    }
    obj['@attributes'] = attrs;
  }

  const children = Array.from(node.children);
  if (children.length === 0) {
    const text = (node.textContent ?? '').trim();
    if (Object.keys(obj).length === 0) return text;
    if (text) obj['#text'] = text;
    return obj;
  }

  for (const child of children) {
    const key = child.tagName;
    const val = xmlNodeToJson(child);
    if (key in obj) {
      if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
      (obj[key] as unknown[]).push(val);
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

export function convertXmlToJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (typeof DOMParser === 'undefined') {
    return JSON.stringify({ error: 'DOMParser requires browser environment' });
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML syntax: ' + (parserError.textContent ?? 'Parse error'));
  }
  const root = doc.documentElement;
  return JSON.stringify({ [root.tagName]: xmlNodeToJson(root) }, null, 2);
}
