"use strict";

const express = require("express");
const router = express.Router();
const { getVideoInfo } = require("../services/youtubeService");

/**
 * GET /api/info?url=<youtube_url>
 * Returns basic video metadata: title, duration, thumbnail, formats.
 */
router.get("/", async (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing required query parameter: url" });
  }

  try {
    const info = await getVideoInfo(url);
    res.json(info);
  } catch (err) {
    console.error("[INFO] Error fetching video info:", err.message);
    next(err);
  }
});

module.exports = router;
