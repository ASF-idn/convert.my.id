export function convertBinaryToString(input: string): string {
  const clean = input.trim();
  if (!clean) return '';
  const tokens = clean.split(/\s+/);
  const bytes = new Uint8Array(
    tokens.map((tok) => {
      if (!/^[01]{1,8}$/.test(tok)) throw new Error(`Invalid binary byte token: "${tok}"`);
      return parseInt(tok, 2);
    })
  );
  return new TextDecoder('utf-8').decode(bytes);
}
