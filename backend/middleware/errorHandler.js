// --- FILE: backend/middleware/errorHandler.js ---
"use strict";

const { ERRORS } = require("../constants/errors");

/**
 * Global Express error handler.
 *
 * Attach a numeric `err.status` for the HTTP status code and a safe
 * `err.userMessage` string for the client-visible error message.
 * Falls back to 500 / ERRORS.UNKNOWN when those fields are absent.
 *
 * @param {Error & { status?: number, userMessage?: string }} err
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  console.error("[ERROR]", err.message);
  const status  = err.status  || 500;
  const message = err.userMessage || ERRORS.UNKNOWN;
  res.status(status).json({ error: message });
};
