// --- FILE: backend/utils/parseProgress.js ---
"use strict";

/**
 * Matches yt-dlp progress lines of the form:
 *   [download]  72.3% of   45.67MiB at    3.21MiB/s ETA 00:12
 */
const PROGRESS_RE =
  /\[download\]\s+([\d.]+)%\s+of\s+([\S]+)\s+at\s+([\S]+)\s+ETA\s+(\S+)/;

/**
 * Parse a yt-dlp stdout progress line.
 *
 * @param {string} line
 * @returns {{ percent: string, filesize: string, speed: string, eta: string }|null}
 */
function parseProgressLine(line) {
  const m = PROGRESS_RE.exec(line);
  if (!m) return null;
  return {
    percent:  m[1],
    filesize: m[2],
    speed:    m[3],
    eta:      m[4],
  };
}

/**
 * Returns true when a yt-dlp line indicates FFmpeg merging is in progress.
 *
 * @param {string} line
 * @returns {boolean}
 */
function isMerging(line) {
  return /\[Merger\]|\[ffmpeg\]/.test(line);
}

/**
 * Returns true when a progress line reports download completion (100%).
 *
 * @param {string} line
 * @returns {boolean}
 */
function isComplete(line) {
  const parsed = parseProgressLine(line);
  return parsed !== null && parsed.percent === "100";
}

module.exports = { parseProgressLine, isMerging, isComplete };
