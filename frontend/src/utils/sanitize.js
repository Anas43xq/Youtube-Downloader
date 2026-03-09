// --- FILE: frontend/src/utils/sanitize.js ---

const ILLEGAL_RE = /[/\\?%*:|"<>]/g;

/**
 * Remove illegal filename characters, replace whitespace with underscores,
 * and truncate to 200 characters.
 *
 * Removed characters: / \ ? % * : | " < >
 * Spaces → _
 *
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFilename(name) {
  return String(name)
    .replace(ILLEGAL_RE, "")
    .replace(/\s+/g, "_")
    .substring(0, 200);
}
