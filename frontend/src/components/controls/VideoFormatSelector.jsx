// --- FILE: frontend/src/components/controls/VideoFormatSelector.jsx ---

import { VIDEO_FORMATS } from "../../constants/formats.js";

/**
 * Small hint lines shown under the active video format button.
 * @type {Record<string, string>}
 */
const FORMAT_HINTS = {
  mp4:  "Widest compatibility",
  webm: "Smaller file size",
  mkv:  "Lossless container",
  mov:  "Apple ecosystem",
};

/**
 * Video format selector — renders null when hidden prop is true.
 *
 * @param {{
 *   videoFormat: string,
 *   onChange: (f: string) => void,
 *   hidden?: boolean
 * }} props
 */
export default function VideoFormatSelector({ videoFormat, onChange, hidden }) {
  if (hidden) return null;

  return (
    <div className="format-selector">
      {VIDEO_FORMATS.map((f) => {
        const active = videoFormat === f.value;
        return (
          <div key={f.value} className="format-selector__item">
            <button
              className={`fmt-btn${active ? " fmt-btn--active" : ""}`}
              onClick={() => onChange(f.value)}
              aria-pressed={active}
            >
              {f.label}
            </button>
            {active && FORMAT_HINTS[f.value] && (
              <span className="format-selector__hint">{FORMAT_HINTS[f.value]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
