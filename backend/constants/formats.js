// --- FILE: backend/constants/formats.js ---
"use strict";

const ALLOWED_QUALITIES     = ["360", "480", "720", "1080"];
const ALLOWED_VIDEO_FORMATS = ["mp4", "webm", "mkv", "mov"];
const ALLOWED_AUDIO_FORMATS = ["mp3", "m4a", "opus", "flac"];
const ALLOWED_MODES         = ["video", "audio", "social_video", "social_audio"];

module.exports = {
  ALLOWED_QUALITIES,
  ALLOWED_VIDEO_FORMATS,
  ALLOWED_AUDIO_FORMATS,
  ALLOWED_MODES,
};
