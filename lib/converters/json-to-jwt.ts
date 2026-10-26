function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function convertJsonToJwt(input: string): string {
  if (!input.trim()) return '';
  const payloadObj: unknown = JSON.parse(input);
  const headerObj = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = encodeBase64Url(JSON.stringify(headerObj));
  const encodedPayload = encodeBase64Url(JSON.stringify(payloadObj));
  const unsignedSig = encodeBase64Url('convert.my.id-client-side-signature-preview');
  return `${encodedHeader}.${encodedPayload}.${unsignedSig}`;
}
