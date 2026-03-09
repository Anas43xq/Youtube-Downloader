// --- FILE: backend/config/paths.js ---
"use strict";

const path = require("path");
const os   = require("os");

/**
 * Default downloads directory — user's ~/Downloads or override via env.
 * @type {string}
 */
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR
  ? path.resolve(process.env.DOWNLOADS_DIR)
  : path.join(os.homedir(), "Downloads");

/**
 * Temp directory used for intermediate files.
 * @type {string}
 */
const TEMP_DIR = process.env.TEMP_DIR
  ? path.resolve(process.env.TEMP_DIR)
  : path.join(os.tmpdir(), "ytdl");

module.exports = { DOWNLOADS_DIR, TEMP_DIR };
