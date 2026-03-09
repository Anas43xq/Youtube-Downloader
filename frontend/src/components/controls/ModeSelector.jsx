// --- FILE: frontend/src/components/controls/ModeSelector.jsx ---

import { MODES, isSocialMode } from "../../constants/modes.js";
import { AUDIO_FORMATS } from "../../constants/formats.js";

const SOCIAL_OPTIONS = [
  { value: MODES.SOCIAL_VIDEO, label: "Universal Video 📱" },
  { value: MODES.SOCIAL_AUDIO, label: "Universal Audio 🎵" },
];

/**
 * Three-button mode row (VIDEO / AUDIO / SOCIAL) with a context-sensitive
 * sub-row:
 *   AUDIO  → audio format selector (MP3, M4A, OPUS, FLAC …)
 *   SOCIAL → social sub-mode selector (Universal Video / Audio)
 *
 * @param {{
 *   mode: string,
 *   onModeChange: (m: string) => void,
 *   audioFormat: string,
 *   onFormatChange: (f: string) => void
 * }} props
 */
export default function ModeSelector({ mode, onModeChange, audioFormat, onFormatChange }) {
  const isAudio  = mode === MODES.AUDIO;
  const isSocial = isSocialMode(mode);

  function selectMode(m) {
    if (isSocialMode(m)) {
      onModeChange(MODES.SOCIAL_VIDEO); // default social sub-mode
    } else {
      onModeChange(m);
    }
  }

  function activePrimary() {
    if (isAudio)  return MODES.AUDIO;
    if (isSocial) return "social";
    return MODES.VIDEO;
  }

  return (
    <div className="mode-selector">
      {/* Primary row */}
      <div className="mode-selector__row">
        {[
          { key: MODES.VIDEO, label: "Video" },
          { key: MODES.AUDIO, label: "Audio" },
          { key: "social",    label: "Social" },
        ].map(({ key, label }) => {
          const active = activePrimary() === key;
          return (
            <button
              key={key}
              className={`mode-btn${active ? " mode-btn--active" : ""}${key === "social" && active ? " social-active" : ""}`}
              onClick={() => selectMode(key === "social" ? MODES.SOCIAL_VIDEO : key)}
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sub-row — audio formats */}
      {isAudio && (
        <div className="mode-selector__sub fadeIn">
          <span className="mode-selector__sub-label">Format</span>
          {AUDIO_FORMATS.map((f) => (
            <button
              key={f.value}
              className={`fmt-btn${audioFormat === f.value ? " fmt-btn--active" : ""}`}
              onClick={() => onFormatChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-row — social sub-modes */}
      {isSocial && (
        <div className="mode-selector__sub fadeIn">
          {SOCIAL_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={`mode-btn mode-btn--sub${mode === value ? " social-active" : ""}`}
              onClick={() => onModeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
