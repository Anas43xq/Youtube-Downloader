// --- FILE: frontend/src/components/TimelineSlider.jsx ---

import { useRef, useCallback } from "react";
import { formatTime } from "../utils/formatTime.js";

/**
 * Visual playhead track with drag-to-seek support.
 * Displays the clip range (startTime→endTime) as an amber region.
 *
 * @param {{
 *   currentTime: number,
 *   duration: number,
 *   startTime: number,
 *   endTime: number,
 *   onSeek: (t: number) => void
 * }} props
 */
export default function TimelineSlider({ currentTime, duration, startTime, endTime, onSeek }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const pct      = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const startPct = duration > 0 ? (startTime  / duration) * 100 : 0;
  const endPct   = duration > 0 ? Math.min((endTime / duration) * 100, 100) : 100;

  const getTimeFromEvent = useCallback((e) => {
    const rect    = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio   = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  function handleMouseDown(e) {
    if (!duration) return;
    dragging.current = true;
    onSeek(getTimeFromEvent(e));

    const onMove = (ev) => { if (dragging.current) onSeek(getTimeFromEvent(ev)); };
    const onUp   = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }

  function handleTouchStart(e) {
    if (!duration) return;
    dragging.current = true;
    onSeek(getTimeFromEvent(e));

    const onMove = (ev) => { if (dragging.current) onSeek(getTimeFromEvent(ev)); };
    const onEnd  = () => {
      dragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend",  onEnd);
  }

  return (
    <div className="timeline-row">
      {/* Track */}
      <div
        className="timeline-track-wrap"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="timeline-track">
          {/* Clip range highlight */}
          <div
            className="timeline-range"
            style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />
          {/* Playhead fill */}
          <div className="timeline-fill" style={{ width: `${pct}%` }} />
          {/* Thumb */}
          <div className="timeline-thumb" style={{ left: `${pct}%` }} />
        </div>
      </div>

      {/* Current-time label */}
      <div style={{ textAlign: "center" }}>
        <span className="timeline-current">
          {formatTime(currentTime)}
          {duration > 0 && (
            <span style={{ color: "var(--text-muted)" }}>
              {" / "}{formatTime(duration)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

