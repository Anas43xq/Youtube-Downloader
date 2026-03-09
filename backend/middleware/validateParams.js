// --- FILE: backend/middleware/validateParams.js ---
"use strict";

const {
  ALLOWED_QUALITIES,
  ALLOWED_VIDEO_FORMATS,
  ALLOWED_AUDIO_FORMATS,
  ALLOWED_MODES,
} = require("../constants/formats");
const { ERRORS } = require("../constants/errors");

/**
 * Middleware: validates req.query.quality when provided.
 * Passes through if quality is absent (caller applies default).
 */
const validateQuality = (req, res, next) => {
  const { quality } = req.query;
  if (quality !== undefined && !ALLOWED_QUALITIES.includes(quality)) {
    return res.status(400).json({ error: ERRORS.INVALID_QUALITY });
  }
  next();
};

/**
 * Middleware: validates req.query.mode when provided.
 */
const validateMode = (req, res, next) => {
  const { mode } = req.query;
  if (mode !== undefined && !ALLOWED_MODES.includes(mode)) {
    return res.status(400).json({ error: ERRORS.INVALID_MODE });
  }
  next();
};

/**
 * Middleware: validates req.query.videoFormat and req.query.audioFormat when provided.
 */
const validateFormats = (req, res, next) => {
  const { videoFormat, audioFormat } = req.query;
  if (videoFormat !== undefined && !ALLOWED_VIDEO_FORMATS.includes(videoFormat)) {
    return res.status(400).json({ error: ERRORS.INVALID_VIDEO_FORMAT });
  }
  if (audioFormat !== undefined && !ALLOWED_AUDIO_FORMATS.includes(audioFormat)) {
    return res.status(400).json({ error: ERRORS.INVALID_AUDIO_FORMAT });
  }
  next();
};

module.exports = { validateQuality, validateMode, validateFormats };
