// --- FILE: backend/utils/sanitize.js ---
"use strict";

const path = require("path");

const ILLEGAL_RE = /[/\\?%*:|"<>]/g;

/**
 * Remove illegal filename characters, replace whitespace with underscores,
 * and truncate to 200 characters.
 *
 * @param {string} name
 * @returns {string}
 */
function sanitizeFilename(name) {
  return String(name)
    .replace(ILLEGAL_RE, "")
    .replace(/\s+/g, "_")
    .substring(0, 200);
}

/**
 * Resolve and validate a file path against an allowed base directory.
 * Throws an error (with status 400) if the resolved path would escape the base.
 *
 * @param {string} filePath    - path to validate (may be relative or absolute)
 * @param {string} allowedBase - the base directory the path must remain within
 * @returns {string} normalized absolute path
 * @throws {Error & { status: number, userMessage: string }}
 */
function sanitizePath(filePath, allowedBase) {
  const normalizedBase = path.resolve(allowedBase);
  const normalizedPath = path.resolve(filePath);

  // Add trailing sep to base to prevent prefix false-positives (e.g. "C:\\").
  const baseWithSep = normalizedBase.endsWith(path.sep)
    ? normalizedBase
    : normalizedBase + path.sep;

  const isAllowed =
    normalizedPath === normalizedBase ||
    normalizedPath.startsWith(baseWithSep);

  if (!isAllowed) {
    const err = new Error("Path traversal detected");
    err.status      = 400;
    err.userMessage = "Invalid file path";
    throw err;
  }

  return normalizedPath;
}

module.exports = { sanitizeFilename, sanitizePath };
