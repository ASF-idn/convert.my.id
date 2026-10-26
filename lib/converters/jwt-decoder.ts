function decodeBase64Url(segment: string): unknown {
  const norm = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4;
  const padded = pad === 2 ? norm + '==' : pad === 3 ? norm + '=' : norm;
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const jsonStr = new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(jsonStr);
}

export function convertJwtDecoder(input: string): string {
  const token = input.trim().replace(/^Bearer\s+/i, '');
  if (!token) return '';
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format. Expected header.payload.signature segments.');
  }
  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);
  return JSON.stringify(
    {
      header,
      payload,
      signaturePresent: Boolean(parts[2]),
      verifiedClientSideNote: 'Decoded locally on convert.my.id without sending secret tokens over the network.',
    },
    null,
    2
  );
}
