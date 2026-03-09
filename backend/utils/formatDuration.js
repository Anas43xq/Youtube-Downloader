// --- FILE: backend/utils/formatDuration.js ---
"use strict";

/**
 * Format a duration in seconds to an HH:MM:SS string.
 * Returns null if the input is falsy or zero.
 *
 * @param {number|null|undefined} seconds
 * @returns {string|null}
 */
function formatDuration(seconds) {
  if (!seconds) return null;
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

module.exports = { formatDuration };
