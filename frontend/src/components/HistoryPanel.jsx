import { useState, useEffect } from "react";

function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Forces a re-render every 60 s so relative timestamps stay fresh
function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
}

export default function HistoryPanel({ history, onRemove, onClear, onReDownload }) {
  const [collapsed, setCollapsed] = useState(true);
  useTick();

  if (history.length === 0 && collapsed) return null;

  return (
    <div className="history-panel">
      <div
        className="history-header"
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setCollapsed((c) => !c)}
      >
        <div className="queue-header-left">
          <span className="queue-title">History</span>
          <span className="queue-count-badge">
            {history.length} entr{history.length !== 1 ? "ies" : "y"}
          </span>
        </div>
        <div className="queue-header-actions">
          {history.length > 0 && (
            <button
              className="queue-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Clear all download history?")) onClear();
              }}
            >
              Clear All
            </button>
          )}
          <span className="history-chevron">{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">No downloads yet</div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-item-meta">
                  <div className="queue-item-title-row">
                    <span className="history-title">{entry.title}</span>
                    {entry.mode === "video" && (
                      <span className="queue-badge">{entry.quality}p</span>
                    )}
                    <span className="queue-badge">
                      {entry.mode === "audio"
                        ? entry.audioFormat.toUpperCase()
                        : entry.videoFormat.toUpperCase()}
                    </span>
                  </div>
                  <div className="history-filename">{entry.filename}</div>
                </div>

                <div className="history-right">
                  <span className="history-time">{relativeTime(entry.downloadedAt)}</span>
                  {entry.filesize && (
                    <span className="history-time">{entry.filesize}</span>
                  )}
                  <div className="history-actions">
                    <button
                      className="redownload-btn"
                      onClick={() => onReDownload(entry)}
                      title="Add to queue again"
                    >
                      ↓ Again
                    </button>
                    <button
                      className="redownload-btn history-remove-btn"
                      onClick={() => onRemove(entry.id)}
                      title="Remove from history"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
