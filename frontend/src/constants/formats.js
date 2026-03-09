// --- FILE: frontend/src/constants/formats.js ---

export const VIDEO_FORMATS = [
  { label: "MP4",  value: "mp4",  hint: "Universal"           },
  { label: "WEBM", value: "webm", hint: "Smallest size"       },
  { label: "MKV",  value: "mkv",  hint: "Best compatibility"  },
  { label: "MOV",  value: "mov",  hint: "Apple / Final Cut"   },
];

export const AUDIO_FORMATS = [
  { label: "MP3",  value: "mp3",  hint: "Universal"    },
  { label: "M4A",  value: "m4a",  hint: "Best quality" },
  { label: "OPUS", value: "opus", hint: "Smallest size" },
  { label: "FLAC", value: "flac", hint: "Lossless"      },
];

export const DEFAULT_VIDEO_FORMAT = "mp4";
export const DEFAULT_AUDIO_FORMAT = "mp3";
