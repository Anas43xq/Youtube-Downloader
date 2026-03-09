// --- FILE: frontend/src/hooks/usePlayer.js ---

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Manages YouTube player state: current playhead, duration, and the
 * user-selected clip start/end range.
 *
 * playerRef.current exposes { seekTo(seconds) } — wired by VideoPlayer.
 */
export default function usePlayer() {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDurationState] = useState(0);
  const [startTime,   setStartTimeState] = useState(0);
  const [endTime,     setEndTimeState]   = useState(0);

  /** @type {React.MutableRefObject<{seekTo: (t: number) => void}|null>} */
  const playerRef = useRef(null);

  // ── Methods ────────────────────────────────────────────────────────────────

  const updateCurrentTime = useCallback((t) => setCurrentTime(t), []);

  const setDuration = useCallback((d) => setDurationState(d), []);

  const setStartTime = useCallback((s) => setStartTimeState(s), []);

  const setEndTime = useCallback((e) => setEndTimeState(e), []);

  /** Seek the player and sync local currentTime. */
  const seek = useCallback((t) => {
    setCurrentTime(t);
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(t);
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  // When a new video loads (duration changes from 0), initialize endTime to
  // the full duration so the clip range covers the whole video by default.
  useEffect(() => {
    if (duration > 0 && endTime === 0) {
      setEndTimeState(duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return {
    currentTime,
    duration,
    startTime,
    endTime,
    playerRef,
    updateCurrentTime,
    setDuration,
    setStartTime,
    setEndTime,
    seek,
  };
}
