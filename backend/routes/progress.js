// --- FILE: backend/routes/progress.js ---
"use strict";

const express  = require("express");
const router   = express.Router();
const path     = require("path");
const fs       = require("fs");
const crypto   = require("crypto");

const validateUrl                              = require("../middleware/validateUrl");
const { validateQuality, validateMode, validateFormats } = require("../middleware/validateParams");
const { downloadWithProgress }                 = require("../services/youtubeService");
const { setJob }                               = require("../utils/jobStore");
const { TEMP_DIR }                             = require("../config/paths");
const { sanitizeFilename }                     = require("../utils/sanitize");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Output file extension for the given mode+format combo. */
function getOutputExt(mode, videoFormat, audioFormat) {
  if (mode === "audio")        return audioFormat || "mp3";
  if (mode === "social_audio") return "mp3";
  if (mode === "social_video") return "mp4";
  return videoFormat || "mp4";
}

/** Write a named SSE event. */
function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ── Route ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/progress?url=&quality=&mode=&videoFormat=&audioFormat=
 *                   &startTime=&endTime=&customFilename=
 *
 * Starts a yt-dlp download in the background, streams progress via SSE.
 *
 * Named events emitted:
 *   progress  → { percent, speed, eta, filesize }
 *   merging   → {}
 *   complete  → { jobId, filePath, filename }
 *   fail      → { message }
 */
router.get("/", validateUrl, validateQuality, validateMode, validateFormats, (req, res) => {
  const {
    url,
    quality        = "720",
    mode           = "video",
    videoFormat    = "mp4",
    audioFormat    = "mp3",
    startTime,
    endTime,
    customFilename = "",
  } = req.query;

  // ── SSE headers ───────────────────────────────────────────────────────────
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
  res.flushHeaders();

  const jobId = crypto.randomUUID();
  const ext   = getOutputExt(mode, videoFormat, audioFormat);

  // Determine output filename for this job
  let outputFilename;
  if (customFilename && customFilename.trim()) {
    const base = sanitizeFilename(customFilename.trim()).replace(/\.[^.]+$/, "");
    outputFilename = base + "." + ext;
  } else {
    outputFilename = "download." + ext;
  }

  const jobDir     = path.join(TEMP_DIR, jobId);
  const outputPath = path.join(jobDir, outputFilename);

  // Create temp directory
  try {
    fs.mkdirSync(jobDir, { recursive: true });
  } catch (err) {
    sse(res, "fail", { message: "Server error: cannot create temp directory" });
    res.end();
    return;
  }

  function cleanup() {
    try { fs.rmSync(jobDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }

  let completed = false;

  // If client disconnects before completion, clean up to avoid orphaned files
  req.on("close", () => {
    if (!completed) cleanup();
  });

  downloadWithProgress({
    url,
    quality,
    mode,
    videoFormat,
    audioFormat,
    startTime:      parseFloat(startTime)  || 0,
    endTime:        endTime != null ? parseFloat(endTime) : null,
    outputPath,
    customFilename: customFilename || "",

    onProgress({ percent, speed, eta, filesize }) {
      sse(res, "progress", { percent, speed, eta, filesize });
    },

    onMerging() {
      sse(res, "merging", {});
    },

    onComplete() {
      completed = true;
      setJob(jobId, { filePath: outputPath, filename: outputFilename });
      sse(res, "complete", { jobId, filePath: outputPath, filename: outputFilename });
      res.end();
    },

    onError(err) {
      const message = (err && err.message) ? err.message : "Download failed";
      console.error("[PROGRESS]", message);
      sse(res, "fail", { message });
      res.end();
      cleanup();
    },
  });
});

module.exports = router;
