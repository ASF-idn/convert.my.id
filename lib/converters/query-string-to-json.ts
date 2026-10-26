export function convertQueryStringToJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const queryPart = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : trimmed;
  const params = new URLSearchParams(queryPart);
  const out: Record<string, unknown> = {};
  params.forEach((val, key) => {
    let parsedVal: unknown = val;
    if (val === 'true') parsedVal = true;
    else if (val === 'false') parsedVal = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) parsedVal = Number(val);
    if (key in out) {
      if (!Array.isArray(out[key])) out[key] = [out[key]];
      (out[key] as unknown[]).push(parsedVal);
    } else {
      out[key] = parsedVal;
    }
  });
  return JSON.stringify(out, null, 2);
}
