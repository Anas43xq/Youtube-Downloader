// --- FILE: frontend/src/constants/modes.js ---

export const MODES = {
  VIDEO:        "video",
  AUDIO:        "audio",
  SOCIAL_VIDEO: "social_video",
  SOCIAL_AUDIO: "social_audio",
};

export const SOCIAL_MODES = [MODES.SOCIAL_VIDEO, MODES.SOCIAL_AUDIO];

export const isSocialMode = (mode) => SOCIAL_MODES.includes(mode);
