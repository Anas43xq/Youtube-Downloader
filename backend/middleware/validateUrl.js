// --- FILE: backend/middleware/validateUrl.js ---
"use strict";

const { ERRORS } = require("../constants/errors");

/**
 * Matches:
 *   https://www.youtube.com/watch?v=<id>
 *   https://youtube.com/watch?v=<id>
 *   https://youtu.be/<id>
 *   https://www.youtube.com/shorts/<id>
 */
const YOUTUBE_URL_RE =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?.*v=[\w-]+|shorts\/[\w-]+)|youtu\.be\/[\w-]+)/;

/**
 * Middleware: validates req.query.url as a YouTube URL.
 * Passes through with next() on success; sends 400 on failure.
 *
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
module.exports = function validateUrl(req, res, next) {
  const { url } = req.query;
  if (!url || !YOUTUBE_URL_RE.test(url)) {
    return res.status(400).json({ error: ERRORS.INVALID_URL });
  }
  next();
};
