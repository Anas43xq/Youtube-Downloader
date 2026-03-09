// --- FILE: backend/config/index.js ---
"use strict";

/**
 * Central configuration — all env-var reads live here.
 * Consumers should require this module instead of reading process.env directly.
 */
module.exports = {
  PORT:        parseInt(process.env.PORT, 10) || 3001,
  NODE_ENV:    process.env.NODE_ENV || "development",
  IS_PROD:     process.env.NODE_ENV === "production",

  // Explicit yt-dlp binary path. Null means use system PATH.
  YTDLP_PATH:  process.env.YTDLP_PATH || null,

  // Job TTL in milliseconds (default 10 min).
  JOB_TTL_MS:  parseInt(process.env.JOB_TTL_MS, 10) || 10 * 60 * 1000,
};
