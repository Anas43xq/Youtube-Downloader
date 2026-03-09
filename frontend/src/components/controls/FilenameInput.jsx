// --- FILE: frontend/src/components/controls/FilenameInput.jsx ---

import { useRef } from "react";
import { resolveFilename, defaultTemplate } from "../../utils/resolveFilename.js";

const TOKENS = ["{title}", "{quality}", "{format}", "{date}", "{time}", "{id}"];

/**
 * Filename template input with token-pill shortcuts and a live preview line.
 *
 * @param {{
 *   template: string,
 *   onChange: (v: string) => void,
 *   preview?: string,
 *   mode: string
 * }} props
 */
export default function FilenameInput({ template, onChange, preview, mode }) {
  const inputRef = useRef(null);

  function insertToken(token) {
    const el  = inputRef.current;
    const val = template || "";
    if (!el) { onChange(val + token); return; }

    const start   = el.selectionStart ?? val.length;
    const end     = el.selectionEnd   ?? start;
    const updated = val.slice(0, start) + token + val.slice(end);
    onChange(updated);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  return (
    <div className="filename-input">
      <input
        ref={inputRef}
        className="filename-input__field"
        type="text"
        value={template}
        onChange={(e) => onChange(e.target.value)}
        placeholder={defaultTemplate(mode)}
        spellCheck={false}
        autoComplete="off"
        aria-label="Filename template"
      />

      <div className="filename-input__pills">
        {TOKENS.map((t) => (
          <button
            key={t}
            className="filename-input__pill"
            type="button"
            onClick={() => insertToken(t)}
            title={`Insert ${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {preview && (
        <div className="filename-input__preview">
          <span className="filename-input__preview-label">Preview:</span>
          <span className="filename-input__preview-value">{preview}</span>
        </div>
      )}
    </div>
  );
}
