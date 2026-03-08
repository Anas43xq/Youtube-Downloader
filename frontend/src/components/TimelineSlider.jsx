import { useRef, useCallback, useState } from "react";

function formatTime(secs) {
  if (!secs || isNaN(secs)) return "00:00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function parseTime(str) {
  const parts = str.trim().split(":").map(Number);
  if (parts.some(isNaN)) return NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(str.trim());
}

function TimeInput({ value, onChange, min = 0, max = 99999, label }) {
  const [draft, setDraft] = useState(null);

  const displayed = draft !== null ? draft : formatTime(value);

  // Check if draft value is out of bounds
  const draftSecs = draft !== null ? parseTime(draft) : value;
  const isInvalid = draft !== null && !isNaN(draftSecs) && (draftSecs < min || draftSecs > max);

  function handleFocus() {
    setDraft(formatTime(value));
  }

  function handleChange(e) {
    // Only allow digits and colons
    const raw = e.target.value.replace(/[^0-9:]/g, "");
    // Limit each segment to 2 digits
    const parts = raw.split(":");
    const cleaned = parts.map((p) => p.slice(0, 2)).slice(0, 3).join(":");
    setDraft(cleaned);
  }

  function commit(str) {
    const secs = parseTime(str);
    if (!isNaN(secs)) {
      // Silently clamp to [min, max]
      onChange(Math.max(min, Math.min(secs, max)));
    }
    setDraft(null);
  }

  function handleBlur(e) {
    commit(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") { e.target.blur(); }
    if (e.key === "Escape") { setDraft(null); e.target.blur(); }
  }

  return (
    <div className="time-field">
      <span className="time-field__label">{label}</span>
      <input
        className={`time-field__input${isInvalid ? " time-field__input--invalid" : ""}`}
        value={displayed}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        maxLength={8}
        aria-label={label}
      />
    </div>
  );
}

export default function TimelineSlider({ currentTime, duration, startTime, endTime, onSeek, onStartChange, onEndChange }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const pct      = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const startPct = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPct   = duration > 0 ? Math.min((endTime / duration) * 100, 100) : 100;

  const getTimeFromEvent = useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  function handleMouseDown(e) {
    if (!duration) return;
    dragging.current = true;
    onSeek(getTimeFromEvent(e));
    const onMove = (ev) => { if (dragging.current) onSeek(getTimeFromEvent(ev)); };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleTouchStart(e) {
    if (!duration) return;
    dragging.current = true;
    onSeek(getTimeFromEvent(e));
    const onMove = (ev) => { if (dragging.current) onSeek(getTimeFromEvent(ev)); };
    const onEnd = () => {
      dragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  }

  return (
    <div className="timeline-row">
      <div
        className="timeline-track-wrap"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="timeline-track">
          <div className="timeline-range" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} />
          <div className="timeline-fill" style={{ width: `${pct}%` }} />
          <div className="timeline-thumb" style={{ left: `${pct}%` }} />
        </div>
      </div>
      <div className="timeline-times">
        <TimeInput
          label="START"
          value={startTime}
          onChange={onStartChange}
          min={0}
          max={endTime > 0 ? endTime : 99999}
        />
        <span className="timeline-current">{formatTime(currentTime)}</span>
        <TimeInput
          label="END"
          value={endTime}
          onChange={onEndChange}
          min={startTime}
          max={duration > 0 ? duration : 99999}
        />
      </div>
    </div>
  );
}
