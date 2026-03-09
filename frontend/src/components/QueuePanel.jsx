import { useState, useCallback } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "";

function OpenFolderBtn({ filePath }) {
  const [label, setLabel] = useState("Open Folder");
  const [errMsg, setErrMsg] = useState(null);

  const handleClick = useCallback(async () => {
    if (!filePath) return;
    setLabel("Opening…");
    setErrMsg(null);
    try {
      const res = await fetch(
        `${BACKEND}/api/open?path=${encodeURIComponent(filePath)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    } catch (_) {
      setErrMsg("Could not open");
      setTimeout(() => setErrMsg(null), 3000);
    } finally {
      setTimeout(() => setLabel("Open Folder"), 1200);
    }
  }, [filePath]);

  if (errMsg) return <span className="queue-open-error">{errMsg}</span>;

  return (
    <button
      className="open-folder-btn"
      onClick={handleClick}
      disabled={!filePath}
      title={filePath || ""}
    >
      📁 {label}
    </button>
  );
}

function StatusLine({ item }) {
  switch (item.status) {
    case "queued":
      return <span className="queue-status-queued">Queued</span>;

    case "downloading":
      return (
        <div className="queue-status-active">
          <div className="queue-progress-wrap">
            <div className="queue-progress-fill queue-progress-indeterminate" />
          </div>
          <span>Downloading…</span>
        </div>
      );

    case "merging":
      return (
        <div className="queue-status-active">
          <div className="queue-progress-wrap">
            <div className="queue-progress-fill" style={{ width: "100%" }} />
          </div>
          <span>Merging…</span>
        </div>
      );

    case "done":
      return (
        <span className="queue-status-done-row">
          <span className="queue-status-done">✓ Saved</span>
          <OpenFolderBtn filePath={item.filePath} />
        </span>
      );

    case "error":
      return (
        <span className="queue-status-error" title={item.error}>
          {item.error || "Error"}
        </span>
      );

    default:
      return null;
  }
}

export default function QueuePanel({ items, onRemove, onClearDone, onDownloadAll, isRunning }) {
  if (items.length === 0) return null;

  const doneCount = items.filter((i) => i.status === "done").length;
  const queuedCount = items.filter((i) => i.status === "queued").length;

  return (
    <div className="queue-panel">
      <div className="queue-header">
        <div className="queue-header-left">
          <span className="queue-title">Queue</span>
          <span className="queue-count-badge">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="queue-header-actions">
          {doneCount > 0 && (
            <button className="queue-btn-secondary" onClick={onClearDone}>
              Clear Done ({doneCount})
            </button>
          )}
          <button
            className="queue-btn-primary"
            onClick={onDownloadAll}
            disabled={isRunning || queuedCount === 0}
          >
            {isRunning ? (
              <>
                <span className="spinner" style={{ width: 12, height: 12 }} />
                Downloading…
              </>
            ) : (
              "Download All"
            )}
          </button>
        </div>
      </div>

      <div className="queue-list">
        {items.map((item) => (
          <div key={item.id} className="queue-item">
            {item.thumbnail ? (
              <img
                className="queue-thumb"
                src={item.thumbnail}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="queue-thumb queue-thumb-placeholder" />
            )}

            <div className="queue-item-meta">
              <div className="queue-item-title-row">
                <span className="queue-item-title">{item.title}</span>
                {item.mode === "video" && (
                  <span className="queue-badge">{item.quality}p</span>
                )}
                <span className="queue-badge">
                  {item.mode === "audio"
                    ? item.audioFormat.toUpperCase()
                    : item.videoFormat.toUpperCase()}
                </span>
              </div>
              <div className="queue-item-status">
                <StatusLine item={item} />
              </div>
            </div>

            <button
              className="queue-remove-btn"
              onClick={() => onRemove(item.id)}
              disabled={item.status === "downloading" || item.status === "merging"}
              title="Remove from queue"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
