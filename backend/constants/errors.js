// --- FILE: backend/constants/errors.js ---
"use strict";

const ERRORS = {
  INVALID_URL:          "Invalid YouTube URL",
  INVALID_QUALITY:      "Invalid quality parameter",
  INVALID_MODE:         "Invalid mode parameter",
  INVALID_VIDEO_FORMAT: "Invalid video format parameter",
  INVALID_AUDIO_FORMAT: "Invalid audio format parameter",
  INVALID_OUTPUT_DIR:   "Invalid output directory",
  INVALID_PATH:         "Invalid file path",
  NOT_FOUND:            "Requested resource not found",
  DOWNLOAD_FAILED:      "Download failed",
  INFO_FAILED:          "Failed to fetch video info",
  PERMISSION_DENIED:    "Server could not open the folder",
  UNKNOWN:              "Something went wrong",
};

module.exports = { ERRORS };
