"use strict";

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const { PORT, IS_PROD }  = require("./config/index");
const { DOWNLOADS_DIR }  = require("./config/paths");
const errorHandler       = require("./middleware/errorHandler");
const { clearExpiredJobs } = require("./utils/jobStore");

clearExpiredJobs();

const infoRouter     = require("./routes/info");
const downloadRouter = require("./routes/download");
const progressRouter = require("./routes/progress");
const fileRouter     = require("./routes/file");
const openRouter     = require("./routes/open");

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(new Error("CORS: origin '" + origin + "' not allowed"));
  },
  methods: ["GET", "OPTIONS"],
}));

app.use(express.json());

app.use("/api/info",     infoRouter);
app.use("/api/download", downloadRouter);
app.use("/api/progress", progressRouter);
app.use("/api/file",     fileRouter);
app.use("/api/open",     openRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/config", (_req, res) => {
  res.json({ defaultOutputDir: DOWNLOADS_DIR });
});

const DIST_DIR = path.join(__dirname, "..", "frontend", "dist");
if (IS_PROD && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("\u2713 YTDL running on http://localhost:" + PORT + " [" + (IS_PROD ? "production" : "development") + "]");
});
