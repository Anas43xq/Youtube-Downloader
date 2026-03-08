export default function VideoInput({ url, onChange, onLoad, loading }) {
  function handleKey(e) {
    if (e.key === "Enter") onLoad();
  }

  return (
    <div className="video-input-wrap">
      <input
        className="url-input"
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="https://www.youtube.com/watch?v=..."
        spellCheck={false}
        autoComplete="off"
      />
      <button
        className="load-btn"
        onClick={onLoad}
        disabled={loading || !url.trim()}
      >
        {loading ? "Loading…" : "Load Video"}
      </button>
    </div>
  );
}
