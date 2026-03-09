// --- FILE: frontend/src/utils/formatTime.js ---

/**
 * Format a number of seconds into an HH:MM:SS string.
 * Returns "00:00:00" for null, undefined, or NaN inputs.
 *
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return "00:00:00";
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
