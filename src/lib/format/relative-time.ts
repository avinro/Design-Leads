/**
 * Format a date as a human-readable relative time string.
 *
 * Rules:
 * - < 60 s  → "just now"
 * - < 60 m  → "Xm ago"
 * - < 24 h  → "Xh ago"
 * - < 7 d   → "Xd ago"
 * - >= 7 d  → absolute date "MMM d, yyyy" (e.g. "May 9, 2026")
 *
 * @param date - The date to format (string, Date, or numeric timestamp).
 * @param now  - Reference point for the diff; defaults to Date.now(). Pass a
 *               fixed value in tests to avoid flakiness.
 */
export function relativeTime(date: string | Date | number, now: number = Date.now()): string {
  const ms = typeof date === "number" ? date : new Date(date).getTime();
  const diffMs = now - ms;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${String(diffMin)}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${String(diffHour)}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${String(diffDay)}d ago`;

  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
