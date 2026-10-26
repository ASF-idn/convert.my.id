export function convertUnixTimestampToDate(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const num = Number(trimmed);
  const d = !Number.isNaN(num)
    ? new Date(trimmed.length <= 10 ? num * 1000 : num)
    : new Date(trimmed);

  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid Unix timestamp or date string.');
  }

  return JSON.stringify(
    {
      unixSeconds: Math.floor(d.getTime() / 1000),
      unixMilliseconds: d.getTime(),
      iso8601: d.toISOString(),
      utcString: d.toUTCString(),
      localString: d.toString(),
    },
    null,
    2
  );
}
