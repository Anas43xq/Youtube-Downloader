// --- FILE: frontend/src/components/controls/UrlInputBar.jsx ---

/**
 * URL input bar with an accent LOAD button.
 *
 * @param {{
 *   url: string,
 *   onChange: (v: string) => void,
 *   onLoad: () => void,
 *   loading: boolean
 * }} props
 */
export default function UrlInputBar({ url, onChange, onLoad, loading }) {
  function handleKey(e) {
    if (e.key === "Enter") onLoad();
  }

  return (
    <div className="url-input-bar">
      <input
        className="url-input-bar__input"
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Paste YouTube URL..."
        spellCheck={false}
        autoComplete="off"
      />
      <button
        className="url-input-bar__btn"
        onClick={onLoad}
        disabled={loading || !url.trim()}
      >
        {loading ? "Loading…" : "LOAD"}
      </button>
    </div>
  );
}
