// --- FILE: backend/routes/info.js ---
"use strict";

const express      = require("express");
const router       = express.Router();
const validateUrl  = require("../middleware/validateUrl");
const { getVideoInfo } = require("../services/youtubeService");

/**
 * GET /api/info?url=<youtube_url>
 * Returns VideoInfo JSON: title, duration, thumbnail, availableQualities, isShort.
 */
router.get("/", validateUrl, async (req, res, next) => {
  try {
    const info = await getVideoInfo(req.query.url);
    res.json(info);
  } catch (err) {
    console.error("[INFO]", err.message);
    next(err);
  }
});

module.exports = router;
