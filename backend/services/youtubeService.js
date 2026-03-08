"use strict";

const YTDlpWrap = require("yt-dlp-wrap").default;
const path = require("path");
const os = require("os");

// ─── Init yt-dlp-wrap ────────────────────────────────────────────────────────
// Uses the system `yt-dlp` binary in PATH.
const ytDlp = new YTDlpWrap();

// ─── Default Downloads Directory ─────────────────────────────────────────────
const DOWNLOADS_DIR = path.join(os.homedir(), "Downloads");

// ─── Quality Format Selector ─────────────────────────────────────────────────
function buildFormatSelector(quality) {
  const q = parseInt(quality, 10);
  return [
    `bestvideo[height<=${q}][ext=mp4]+bestaudio[ext=m4a]/`,
    `bestvideo[height<=${q}]+bestaudio/`,
    `best[height<=${q}][ext=mp4]/`,
    `best[height<=${q}]/`,
    `best[ext=mp4]/`,
    `best`,
  ].join("");
}

// ─── Sanitize filename ───────────────────────────────────────────────────────
function sanitizeFilename(name) {
  return name
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 120);
}

// ─── Format duration ─────────────────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// ─── Format seconds as HH:MM:SS for yt-dlp sections ─────────────────────────
function formatSectionTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// ─── getVideoInfo ────────────────────────────────────────────────────────────
async function getVideoInfo(url) {
  let metadata;
  try {
    metadata = await ytDlp.getVideoInfo(url);
  } catch (err) {
    throw new Error(`yt-dlp failed to fetch info: ${err.message}`);
  }

  const formats = metadata.formats || [];
  const availableHeights = [
    ...new Set(
      formats
        .map((f) => f.height)
        .filter((h) => h && [360, 480, 720, 1080].includes(h))
        .sort((a, b) => a - b)
    ),
  ];

  return {
    title: metadata.title || "Unknown Title",
    duration: formatDuration(metadata.duration),
    durationSeconds: metadata.duration || 0,
    thumbnail: metadata.thumbnail || null,
    uploader: metadata.uploader || null,
    viewCount: metadata.view_count || null,
    availableQualities: availableHeights.map(String),
  };
}

// ─── downloadVideo ───────────────────────────────────────────────────────────
async function downloadVideo(url, quality, startTime = 0, endTime = null, outputDir = null) {
  const formatSelector = buildFormatSelector(quality);
  const isClip = startTime > 0 || endTime !== null;

  let title = "video";
  try {
    const meta = await ytDlp.getVideoInfo(url);
    title = sanitizeFilename(meta.title || "video");
  } catch (_) {
    // Non-fatal — use generic filename
  }

  // Use a unique filename for clips to avoid colliding with the full video
  let filename;
  if (isClip) {
    const startTag = formatSectionTime(startTime).replace(/:/g, "-");
    const endTag   = endTime !== null ? formatSectionTime(endTime).replace(/:/g, "-") : "end";
    filename = `${title}_${quality}p_${startTag}_${endTag}.mp4`;
  } else {
    filename = `${title}_${quality}p.mp4`;
  }

  const outputPath = path.join(outputDir || DOWNLOADS_DIR, filename);

  const args = [
    url,
    "-f", formatSelector,
    "--merge-output-format", "mp4",
    "-o", outputPath,
    "--no-playlist",
    "--force-overwrites",          // always overwrite — never skip
    "--concurrent-fragments", "8",
    "--buffer-size", "16K",
    "--http-chunk-size", "10M",
  ];

  if (isClip) {
    const start = formatSectionTime(startTime);
    const end   = endTime !== null ? formatSectionTime(endTime) : "99:59:59";
    args.push("--download-sections", `*${start}-${end}`);
    args.push("--force-keyframes-at-cuts");
  }

  try {
    await ytDlp.execPromise(args);
  } catch (err) {
    const msg = err.message || "";
    if (msg.includes("ffmpeg is not installed")) {
      throw new Error("ffmpeg is required for clipping. Install it from https://ffmpeg.org/download.html and add it to your PATH, then restart the server.");
    }
    throw err;
  }

  return { filePath: outputPath, filename };
}

module.exports = { getVideoInfo, downloadVideo, DOWNLOADS_DIR };
