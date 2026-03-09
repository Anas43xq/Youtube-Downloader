// --- FILE: frontend/src/components/clip/ClipRangeSelector.jsx ---

import { useState } from "react";
import { formatTime } from "../../utils/formatTime.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTime(str) {
  const parts = (str || "").trim().split(":").map(Number);
  if (parts.some(isNaN)) return NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60  + parts[1];
  return Number((str || "").trim());
}

// ── TimeInput ─────────────────────────────────────────────────────────────────

/**
 * Single HH:MM:SS input with draft editing, validation, and Escape-to-revert.
 *
 * @param {{
 *   label: string,
 *   value: number,
 *   onChange: (secs: number) => void,
 *   min?: number,
 *   max?: number,
 *   helperText?: string
 * }} props
 */
function TimeInput({ label, value, onChange, min = 0, max = 99999, helperText }) {
  const [draft, setDraft] = useState(null);

  const displayed  = draft !== null ? draft : formatTime(value);
  const draftSecs  = draft !== null ? parseTime(draft) : value;
  const isInvalid  = draft !== null && (!isNaN(draftSecs) ? (draftSecs < min || draftSecs > max) : true);

  function handleFocus() {
    setDraft(formatTime(value));
  }

  function handleChange(e) {
    // Allow only digits and colons; cap each segment at 2 digits
    const raw     = e.target.value.replace(/[^0-9:]/g, "");
    const parts   = raw.split(":");
    const cleaned = parts.map((p) => p.slice(0, 2)).slice(0, 3).join(":");
    setDraft(cleaned);
  }

  function commit(str) {
    const secs = parseTime(str);
    if (!isNaN(secs)) {
      onChange(Math.max(min, Math.min(secs, max)));
    }
    setDraft(null);
  }

  function handleBlur(e) {
    // Revert on invalid blur (don't commit out-of-range value)
    if (isInvalid) {
      setDraft(null);
    } else {
      commit(e.target.value);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter")  { e.target.blur(); }
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
        aria-invalid={isInvalid}
      />
      {isInvalid && helperText && (
        <span style={{ fontSize: "10px", color: "var(--red)", marginTop: 2 }}>
          {helperText}
        </span>
      )}
    </div>
  );
}

// ── ClipRangeSelector ─────────────────────────────────────────────────────────

/**
 * START / END clip range inputs with cross-field validation.
 *
 * Validation rules:
 *   start must be < end
 *   end must be ≤ duration (when duration > 0)
 *
 * @param {{
 *   startTime: number,
 *   endTime: number,
 *   duration: number,
 *   onStartChange: (t: number) => void,
 *   onEndChange: (t: number) => void
 * }} props
 */
export default function ClipRangeSelector({ startTime, endTime, duration, onStartChange, onEndChange }) {
  const maxEnd   = duration > 0 ? duration : 99999;
  const maxStart = endTime  > 0 ? endTime  : maxEnd;

  return (
    <div className="timeline-times">
      <TimeInput
        label="START"
        value={startTime}
        onChange={onStartChange}
        min={0}
        max={maxStart}
        helperText={`Max ${formatTime(maxStart)}`}
      />
      <TimeInput
        label="END"
        value={endTime}
        onChange={onEndChange}
        min={startTime}
        max={maxEnd}
        helperText={`Between ${formatTime(startTime)} and ${formatTime(maxEnd)}`}
      />
    </div>
  );
}
