// --- FILE: backend/routes/open.js ---
"use strict";

const express = require("express");
const router  = express.Router();
const path    = require("path");
const { spawn } = require("child_process");

const { sanitizePath } = require("../utils/sanitize");
const { DOWNLOADS_DIR } = require("../config/paths");

/**
 * GET /api/open?path=<encoded_absolute_file_path>
 *
 * Reveals the downloaded file in the OS file manager (Explorer / Finder / Nautilus).
 * Uses sanitizePath to block path-traversal attempts.
 */
router.get("/", (req, res) => {
  const rawPath = (req.query.path || "").replace(/\0/g, "").trim();

  if (!rawPath) {
    return res.status(400).json({ error: "Missing required query parameter: path" });
  }

  if (!path.isAbsolute(rawPath)) {
    return res.status(400).json({ error: "path must be absolute" });
  }

  // Use the drive root / filesystem root as the allowed base so any absolute
  // path is accepted, while still blocking null-byte / traversal sequences.
  const root = path.parse(rawPath).root || "/";
  let filePath;
  try {
    filePath = sanitizePath(rawPath, root);
  } catch {
    return res.status(400).json({ error: "Invalid file path" });
  }

  const platform = process.platform;
  let child;

  try {
    if (platform === "win32") {
      // /select highlights the specific file in Explorer
      child = spawn("explorer.exe", ["/select," + filePath], { detached: true, stdio: "ignore" });
    } else if (platform === "darwin") {
      // -R reveals the file in Finder
      child = spawn("open", ["-R", filePath], { detached: true, stdio: "ignore" });
    } else {
      // Linux/BSD — open the containing folder
      child = spawn("xdg-open", [path.dirname(filePath)], { detached: true, stdio: "ignore" });
    }
    child.unref();
    return res.json({ success: true });
  } catch (err) {
    console.error("[OPEN]", err.message);
    return res.status(500).json({ error: "Could not open folder" });
  }
});

module.exports = router;
