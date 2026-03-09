// --- FILE: frontend/src/utils/relativeTime.js ---

/**
 * Interval (ms) between display refreshes for callers that show live relative times.
 * Export so UI components can wire a single setInterval.
 */
export const UPDATE_INTERVAL = 60_000;

/**
 * Convert a Unix timestamp (ms from Date.now()) to a human-readable relative string.
 *
 * Output:
 *   < 60 s            → "just now"
 *   < 60 min          → "X min ago"
 *   < 24 hr           → "X hr ago"
 *   < 30 days         → "X days ago"
 *   ≥ 30 days         → "Mon DD YYYY"  (e.g. "Mar 9 2026")
 *
 * @param {number} timestamp  - value from Date.now()
 * @returns {string}
 */
export function relativeTime(timestamp) {
  const diffMs  = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs  / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return "just now";
  if (diffMin < 60)  return `${diffMin} min ago`;
  if (diffHr  < 24)  return `${diffHr} hr ago`;
  if (diffDay < 30)  return `${diffDay} days ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}
