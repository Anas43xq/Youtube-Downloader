// --- FILE: backend/utils/ytdlArgs.js ---
"use strict";

// ─── Format configs ───────────────────────────────────────────────────────────

const AUDIO_FORMAT_CONFIG = {
  mp3:  { formatSelector: "bestaudio[ext=m4a]/bestaudio/best",  audioFormat: "mp3",  qualityFlag: true  },
  m4a:  { formatSelector: "bestaudio[ext=m4a]/bestaudio/best",  audioFormat: "m4a",  qualityFlag: true  },
  opus: { formatSelector: "bestaudio[ext=webm]/bestaudio/best", audioFormat: "opus", qualityFlag: true  },
  flac: { formatSelector: "bestaudio[ext=m4a]/bestaudio/best",  audioFormat: "flac", qualityFlag: false },
};

const VIDEO_FORMAT_CONFIG = {
  mp4: {
    formatSelector: (q) =>
      `bestvideo[height<=${q}][ext=mp4]+bestaudio[ext=m4a]/` +
      `bestvideo[height<=${q}]+bestaudio/` +
      `best[height<=${q}][ext=mp4]/best[height<=${q}]/best[ext=mp4]/best`,
    mergeFormat: "mp4",
  },
  webm: {
    formatSelector: (q) =>
      `bestvideo[height<=${q}][ext=webm]+bestaudio[ext=webm]/` +
      `bestvideo[height<=${q}]+bestaudio/` +
      `best[height<=${q}][ext=webm]/best[height<=${q}]/best`,
    mergeFormat: "webm",
  },
  mkv: {
    formatSelector: (q) =>
      `bestvideo[height<=${q}]+bestaudio/best[height<=${q}]/best`,
    mergeFormat: "mkv",
  },
  mov: {
    formatSelector: (q) =>
      `bestvideo[height<=${q}][ext=mp4]+bestaudio[ext=m4a]/` +
      `bestvideo[height<=${q}]+bestaudio/best[height<=${q}]/best`,
    mergeFormat: "mov",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** @param {number} secs @returns {string} HH:MM:SS */
function formatSectionTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

const PERF_FLAGS = [
  "--no-playlist",
  "--force-overwrites",
  "--concurrent-fragments", "8",
  "--buffer-size", "16K",
  "--http-chunk-size", "10M",
];

// ─── buildArgs ────────────────────────────────────────────────────────────────

/**
 * Build a yt-dlp argument array for the given download parameters.
 * Pure function — no exec calls, no side-effects.
 *
 * @param {{
 *   url: string,
 *   quality: string,
 *   mode: "video"|"audio"|"social_video"|"social_audio",
 *   videoFormat: string,
 *   audioFormat: string,
 *   outputPath: string,
 *   startTime?: number,
 *   endTime?: number|null
 * }} opts
 * @returns {string[]}
 */
function buildArgs({ url, quality, mode, videoFormat, audioFormat, outputPath, startTime = 0, endTime = null }) {
  const isClip = startTime > 0 || endTime !== null;
  let args;

  if (mode === "social_audio") {
    args = [
      url,
      "-f", "bestaudio[ext=m4a]/bestaudio/best",
      "--extract-audio",
      "--audio-format", "mp3",
      "--audio-quality", "0",
      "-o", outputPath,
      "--quiet",
      ...PERF_FLAGS,
    ];

  } else if (mode === "social_video") {
    args = [
      url,
      "-f",
      "bestvideo[vcodec^=avc1][height<=1080]+bestaudio[acodec^=mp4a]/" +
        "bestvideo[vcodec^=avc][height<=1080]+bestaudio[acodec^=mp4a]/" +
        "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
      "--merge-output-format", "mp4",
      "--postprocessor-args",
      "ffmpeg:-vcodec libx264 -acodec aac -vf scale=-2:1080 -crf 23 -preset fast -movflags +faststart",
      "-o", outputPath,
      "--quiet",
      ...PERF_FLAGS,
    ];

  } else if (mode === "audio") {
    const afmt = AUDIO_FORMAT_CONFIG[audioFormat] || AUDIO_FORMAT_CONFIG.mp3;
    args = [
      url,
      "-f", afmt.formatSelector,
      "--extract-audio",
      "--audio-format", afmt.audioFormat,
      ...(afmt.qualityFlag ? ["--audio-quality", "0"] : []),
      "-o", outputPath,
      "--quiet",
      ...PERF_FLAGS,
    ];

  } else {
    // video mode
    const q    = parseInt(quality, 10);
    const vfmt = VIDEO_FORMAT_CONFIG[videoFormat] || VIDEO_FORMAT_CONFIG.mp4;
    args = [
      url,
      "-f", vfmt.formatSelector(q),
      "--merge-output-format", vfmt.mergeFormat,
      "-o", outputPath,
      "--quiet",
      ...PERF_FLAGS,
    ];
  }

  if (isClip) {
    const start = formatSectionTime(startTime);
    const end   = endTime !== null ? formatSectionTime(endTime) : "99:59:59";
    args.push("--download-sections", `*${start}-${end}`);
    args.push("--force-keyframes-at-cuts");
  }

  return args;
}

module.exports = { buildArgs };
