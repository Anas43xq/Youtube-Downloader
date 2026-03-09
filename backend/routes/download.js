// --- FILE: backend/routes/download.js ---
"use strict";

const express = require("express");
const router  = express.Router();
const path    = require("path");
const fs      = require("fs");

const validateUrl                                        = require("../middleware/validateUrl");
const { validateQuality, validateMode, validateFormats } = require("../middleware/validateParams");
const { downloadVideo }                                  = require("../services/youtubeService");

router.get("/", validateUrl, validateQuality, validateMode, validateFormats, async (req, res, next) => {
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

  const startSecs = Math.max(0, parseFloat(startTime) || 0);
  const endSecs   = endTime != null ? parseFloat(endTime) : null;

  // Validate optional output directory
  let validatedOutputDir = null;
  if (req.query.outputDir) {
    const raw = req.query.outputDir.trim();
    if (raw.includes("\0")) return res.status(400).json({ error: "Invalid output directory" });
    const normalized = path.normalize(raw);
    if (!path.isAbsolute(normalized)) return res.status(400).json({ error: "Output directory must be absolute" });
    try { fs.mkdirSync(normalized, { recursive: true }); } catch (e) {
      return res.status(400).json({ error: "Cannot create output directory: " + e.message });
    }
    validatedOutputDir = normalized;
  }

  // Sanitize optional custom filename
  const safeFilename = customFilename
    ? String(customFilename).replace(/\0/g, "").replace(/[\/\\]/g, "_").substring(0, 200).trim()
    : "";

  try {
    const { filename, filePath } = await downloadVideo(
      url, quality, mode, videoFormat, audioFormat,
      startSecs, endSecs, validatedOutputDir, safeFilename,
    );
    res.json({ success: true, filename, filePath });
  } catch (err) {
    console.error("[DOWNLOAD]", err.message);
    next(err);
  }
});

module.exports = router;
