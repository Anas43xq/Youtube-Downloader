import { useRef } from "react";
import { defaultTemplate } from "../utils/resolveFilename.js";

const TOKENS = ["{title}", "{quality}", "{format}", "{date}", "{time}", "{id}"];

/**
 * Filename template input with token-pill shortcuts and a live preview line.
 *
 * Props:
 *   template  — current template string (controlled)
 *   onChange  — called with updated string
 *   preview   — resolved filename string to display (empty = hide preview)
 *   mode      — "video" | "audio" (drives placeholder text)
 */
export default function FilenameInput({ template, onChange, preview, mode }) {
  const inputRef = useRef(null);

  const insertToken = (token) => {
    const el = inputRef.current;
    const val = template || "";
    if (!el) {
      onChange(val + token);
      return;
    }
    const start = el.selectionStart ?? val.length;
    const end = el.selectionEnd ?? start;
    const updated = val.slice(0, start) + token + val.slice(end);
    onChange(updated);
    // Restore focus and move cursor to after the inserted token
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  };

  return (
    <div className="filename-row">
      <span className="quality-label">Filename</span>
      <div className="filename-field">
        <input
          ref={inputRef}
          className="filename-input"
          type="text"
          value={template}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultTemplate(mode)}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="token-pills">
          {TOKENS.map((t) => (
            <button
              key={t}
              className="token-pill"
              type="button"
              onClick={() => insertToken(t)}
              title={`Insert ${t}`}
            >
              {t}
            </button>
          ))}
        </div>
        {preview && (
          <div className="filename-preview">
            <span className="filename-preview-label">Preview: </span>
            <span className="filename-preview-value">{preview}</span>
          </div>
        )}
      </div>
    </div>
  );
}
