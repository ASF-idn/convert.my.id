export function convertJsonToQueryString(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(parsed)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => params.append(k, String(item)));
    } else if (typeof v === 'object') {
      params.append(k, JSON.stringify(v));
    } else {
      params.append(k, String(v));
    }
  }
  return params.toString();
}
