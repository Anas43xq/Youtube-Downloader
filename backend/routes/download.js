"use strict";

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { downloadVideo } = require("../services/youtubeService");

/**
 * GET /api/download?url=<youtube_url>&quality=<360|480|720|1080>
 * Streams the video file back to the client.
 */
router.get("/", async (req, res, next) => {
  const { url, quality } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing required query parameter: url" });
  }

  const selectedQuality = quality || "720";
  const allowedQualities = ["360", "480", "720", "1080"];
  if (!allowedQualities.includes(selectedQuality)) {
    return res.status(400).json({
      error: `Invalid quality. Must be one of: ${allowedQualities.join(", ")}`,
    });
  }

  const startTimeSecs = Math.max(0, parseFloat(req.query.startTime) || 0);
  const endTimeSecs = req.query.endTime != null ? parseFloat(req.query.endTime) : null;

  // ── Validate optional custom output directory ──────────────────────────────
  let validatedOutputDir = null;
  if (req.query.outputDir) {
    const raw = req.query.outputDir.trim();
    if (raw.includes("\0")) {
      return res.status(400).json({ error: "Invalid output directory" });
    }
    const normalized = path.normalize(raw);
    if (!path.isAbsolute(normalized)) {
      return res.status(400).json({ error: "Output directory must be an absolute path" });
    }
    try {
      fs.mkdirSync(normalized, { recursive: true });
    } catch (e) {
      return res.status(400).json({ error: `Cannot create output directory: ${e.message}` });
    }
    validatedOutputDir = normalized;
  }

  try {
    const { filename } = await downloadVideo(url, selectedQuality, startTimeSecs, endTimeSecs, validatedOutputDir);
    res.json({ success: true, filename });
  } catch (err) {
    console.error("[DOWNLOAD] Error:", err.message);
    next(err);
  }
});

module.exports = router;
