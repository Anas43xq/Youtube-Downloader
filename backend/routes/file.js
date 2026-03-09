// --- FILE: backend/routes/file.js ---
"use strict";

const express = require("express");
const router  = express.Router();
const path    = require("path");
const fs      = require("fs");

const { getJob, deleteJob } = require("../utils/jobStore");

/**
 * GET /api/file?jobId=<uuid>
 *
 * Streams the completed download file to the client as a binary attachment,
 * then deletes the temp file and removes the job from the store.
 */
router.get("/", (req, res) => {
  const rawJobId = (req.query.jobId || "").trim();

  if (!rawJobId) {
    return res.status(400).json({ error: "Missing required query parameter: jobId" });
  }

  // Basic UUID format check (prevent directory traversal via jobId)
  if (!/^[0-9a-f-]{36}$/i.test(rawJobId)) {
    return res.status(400).json({ error: "Invalid jobId format" });
  }

  const job = getJob(rawJobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found or expired" });
  }

  const { filePath, filename } = job;

  if (!fs.existsSync(filePath)) {
    deleteJob(rawJobId);
    return res.status(404).json({ error: "File not found — it may have already been downloaded" });
  }

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    deleteJob(rawJobId);
    return res.status(500).json({ error: "Cannot stat file" });
  }

  res.setHeader("Content-Length",      stat.size);
  res.setHeader("Content-Type",        "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
  );

  const stream = fs.createReadStream(filePath);

  function cleanupJob() {
    try { fs.rmSync(path.dirname(filePath), { recursive: true, force: true }); } catch { /* ignore */ }
    deleteJob(rawJobId);
  }

  stream.on("error", (err) => {
    console.error("[FILE] Stream error:", err.message);
    // Headers may already be sent; just end the response
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to read file" });
    } else {
      res.end();
    }
    cleanupJob();
  });

  // After the entire file has been piped (stream 'close' fires after pipe finishes),
  // remove the temp directory and the job entry.
  stream.on("close", cleanupJob);

  stream.pipe(res);
});

module.exports = router;
