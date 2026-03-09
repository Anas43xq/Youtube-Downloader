// --- FILE: backend/services/youtubeService.js ---
"use strict";

const YTDlpWrap = require("yt-dlp-wrap").default;
const path      = require("path");

const { YTDLP_PATH }       = require("../config/index");
const { DOWNLOADS_DIR }    = require("../config/paths");
const { buildArgs }        = require("../utils/ytdlArgs");
const { parseProgressLine, isMerging } = require("../utils/parseProgress");
const { sanitizeFilename } = require("../utils/sanitize");
const { formatDuration }   = require("../utils/formatDuration");

// ─── Init yt-dlp-wrap ────────────────────────────────────────────────────────
const ytDlp = YTDLP_PATH ? new YTDlpWrap(YTDLP_PATH) : new YTDlpWrap();

// ─── Extension lookup ─────────────────────────────────────────────────────────
function getOutputExt(mode, videoFormat, audioFormat) {
  if (mode === "audio")        return audioFormat || "mp3";
  if (mode === "social_audio") return "mp3";
  if (mode === "social_video") return "mp4";
  return videoFormat || "mp4";
}

// ─── getVideoInfo ─────────────────────────────────────────────────────────────
async function getVideoInfo(url) {
  let metadata;
  try {
    metadata = await ytDlp.getVideoInfo(url);
  } catch (err) {
    throw new Error("yt-dlp failed to fetch info: " + err.message);
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
    title:              metadata.title     || "Unknown Title",
    duration:           formatDuration(metadata.duration),
    durationSeconds:    metadata.duration  || 0,
    thumbnail:          metadata.thumbnail || null,
    uploader:           metadata.uploader  || null,
    viewCount:          metadata.view_count || null,
    availableQualities: availableHeights.map(String),
    isShort:            url.includes("/shorts/"),
  };
}

// ─── downloadVideo ────────────────────────────────────────────────────────────
/**
 * Legacy promise-based download — saves directly to DOWNLOADS_DIR / outputDir.
 * Used by the legacy /api/download route.
 */
async function downloadVideo(
  url,
  quality       = "720",
  mode          = "video",
  videoFormat   = "mp4",
  audioFormat   = "mp3",
  startTime     = 0,
  endTime       = null,
  outputDir     = null,
  customFilename = "",
) {
  let title = "video";
  try {
    const meta = await ytDlp.getVideoInfo(url);
    title = sanitizeFilename(meta.title || "video");
  } catch { /* use generic */ }

  const ext = getOutputExt(mode, videoFormat, audioFormat);
  let filename;

  if (customFilename && customFilename.trim()) {
    filename = sanitizeFilename(customFilename.trim());
    if (!filename.toLowerCase().endsWith("." + ext)) {
      filename = filename.replace(/\.[^.]+$/, "") + "." + ext;
    }
  } else if (mode === "audio") {
    filename = title + "_audio." + ext;
  } else {
    filename = title + "_" + quality + "p." + ext;
  }

  const outputPath = path.join(outputDir || DOWNLOADS_DIR, filename);
  const args = buildArgs({ url, quality, mode, videoFormat, audioFormat, outputPath, startTime, endTime });

  try {
    await ytDlp.execPromise(args);
  } catch (err) {
    const msg = err.message || "";
    if (msg.includes("ffmpeg is not installed")) {
      throw new Error("ffmpeg is required. Install it and add it to PATH.");
    }
    throw err;
  }

  return { filePath: outputPath, filename };
}

// ─── downloadWithProgress ─────────────────────────────────────────────────────
/**
 * Start a download with granular progress callbacks for the SSE route.
 *
 * opts.outputPath must be the full absolute file path (route pre-computes it).
 * Args are built via ytdlArgs.buildArgs with --quiet replaced by --newline so
 * yt-dlp outputs one progress line per tick.
 */
function downloadWithProgress({
  url,
  quality       = "720",
  mode          = "video",
  videoFormat   = "mp4",
  audioFormat   = "mp3",
  startTime     = 0,
  endTime       = null,
  outputPath,
  onProgress,
  onMerging,
  onComplete,
  onError,
}) {
  // Replace --quiet with --newline so stdout delivers live progress lines
  const rawArgs = buildArgs({ url, quality, mode, videoFormat, audioFormat, outputPath, startTime, endTime });
  const args    = rawArgs.filter((a) => a !== "--quiet").concat(["--newline"]);

  let finished     = false;
  let mergingFired = false;

  function finish(err) {
    if (finished) return;
    finished = true;
    if (err) onError(err); else onComplete();
  }

  let emitter;
  try {
    emitter = ytDlp.exec(args);
  } catch (err) {
    onError(err);
    return;
  }

  // yt-dlp-wrap emits each stdout line as ytDlpEvent(type, data)
  emitter.on("ytDlpEvent", (eventType, eventData) => {
    const line = eventType ? "[" + eventType + "] " + eventData : eventData;

    if (!mergingFired && isMerging(line)) {
      mergingFired = true;
      onMerging();
      return;
    }

    const progress = parseProgressLine(line);
    if (progress) onProgress(progress);
  });

  emitter.on("close", (code) => {
    if (code !== 0 && code !== null) {
      finish(new Error("yt-dlp exited with code " + code));
    } else {
      finish(null);
    }
  });

  emitter.on("error", (err) => {
    finish(err instanceof Error ? err : new Error(String(err)));
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { getVideoInfo, downloadVideo, downloadWithProgress };