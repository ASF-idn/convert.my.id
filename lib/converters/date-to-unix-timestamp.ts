export function convertDateToUnixTimestamp(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date string format. Use ISO-8601 (e.g. 2026-10-26T12:00:00Z).');
  }
  return JSON.stringify(
    {
      inputDate: trimmed,
      unixSeconds: Math.floor(date.getTime() / 1000),
      unixMilliseconds: date.getTime(),
      iso8601UTC: date.toISOString(),
    },
    null,
    2
  );
}
