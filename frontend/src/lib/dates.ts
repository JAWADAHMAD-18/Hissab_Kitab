/**
 * Returns the month string "YYYY-MM" in Asia/Karachi (PKT, UTC+5) for a given date.
 * Defaults to "now" if no date is provided.
 */
export function getPkMonth(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA formats as YYYY-MM-DD
  return formatter.format(date).slice(0, 7);
}
