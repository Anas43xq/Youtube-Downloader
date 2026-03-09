// --- FILE: frontend/src/hooks/useSettings.js ---

import { useState, useCallback } from "react";
import { MODES, isSocialMode } from "../constants/modes.js";
import { DEFAULT_QUALITY } from "../constants/qualities.js";
import { DEFAULT_VIDEO_FORMAT, DEFAULT_AUDIO_FORMAT } from "../constants/formats.js";

/**
 * Manages all user-facing download settings.
 *
 * Invariant: switching to any social mode resets quality and videoFormat
 * to their defaults (social mode ignores both).
 */
export default function useSettings() {
  const [quality,          setQualityState]   = useState(DEFAULT_QUALITY);
  const [mode,             setModeState]      = useState(MODES.VIDEO);
  const [videoFormat,      setVideoFormatState] = useState(DEFAULT_VIDEO_FORMAT);
  const [audioFormat,      setAudioFormatState] = useState(DEFAULT_AUDIO_FORMAT);
  const [filenameTemplate, setFilenameTemplate] = useState("");

  const setQuality     = useCallback((q) => setQualityState(q), []);
  const setVideoFormat = useCallback((f) => setVideoFormatState(f), []);
  const setAudioFormat = useCallback((f) => setAudioFormatState(f), []);

  const setMode = useCallback((m) => {
    setModeState(m);
    if (isSocialMode(m)) {
      setQualityState(DEFAULT_QUALITY);
      setVideoFormatState(DEFAULT_VIDEO_FORMAT);
    }
  }, []);

  return {
    quality,
    mode,
    videoFormat,
    audioFormat,
    filenameTemplate,
    setQuality,
    setMode,
    setVideoFormat,
    setAudioFormat,
    setFilenameTemplate,
  };
}
