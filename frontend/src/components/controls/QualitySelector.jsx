// --- FILE: frontend/src/components/controls/QualitySelector.jsx ---

import { QUALITIES } from "../../constants/qualities.js";

/**
 * Quality selector — renders null when hidden prop is true.
 *
 * @param {{
 *   quality: string,
 *   onChange: (q: string) => void,
 *   hidden?: boolean
 * }} props
 */
export default function QualitySelector({ quality, onChange, hidden }) {
  if (hidden) return null;

  return (
    <div className="quality-selector">
      {QUALITIES.map((q) => (
        <button
          key={q.value}
          className={`quality-btn${quality === q.value ? " quality-btn--active" : ""}`}
          onClick={() => onChange(q.value)}
          aria-pressed={quality === q.value}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
