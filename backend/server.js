"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { DOWNLOADS_DIR } = require("./services/youtubeService");
const infoRouter = require("./routes/info");
const downloadRouter = require("./routes/download");

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === "production";

// ─── Middleware ──────────────────────────────────────────────────────────────
if (!IS_PROD) {
  // Dev: allow Vite dev server origin
  app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "OPTIONS"],
  }));
}
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/info", infoRouter);
app.use("/api/download", downloadRouter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── Config ──────────────────────────────────────────────────────────────────
app.get("/api/config", (_req, res) => {
  res.json({ defaultOutputDir: DOWNLOADS_DIR });
});

// ─── Serve Frontend (production) ─────────────────────────────────────────────
const DIST_DIR = path.join(__dirname, "..", "frontend", "dist");
if (IS_PROD && fs.existsSync(DIST_DIR)) {
  // Cache hashed assets long-term, but never cache index.html
  app.use(express.static(DIST_DIR, { index: false }));
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  // Dev: 404 for unknown routes
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ YTDL running on http://localhost:${PORT} [${IS_PROD ? "production" : "development"}]`);
});
