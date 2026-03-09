// --- FILE: frontend/src/components/queue/QueueItem.jsx ---

import { useState, useCallback } from "react";
import Badge from "../common/Badge.jsx";
import ProgressBar from "../download/ProgressBar.jsx";
import { openFolder } from "../../services/apiService.js";
import { MODES, isSocialMode } from "../../constants/modes.js";

// ── OpenFolderButton ─────────────────────────────────────────────────────────

function OpenFolderButton({ filePath }) {
  const [label, setLabel] = useState("Open Folder");
  const [errMsg, setErrMsg] = useState(null);

  const handleClick = useCallback(async () => {
    if (!filePath) return;
    setLabel("Opening…");
    setErrMsg(null);
    try {
      await openFolder(filePath);
    } catch {
      setErrMsg("Could not open");
      setTimeout(() => setErrMsg(null), 3000);
    } finally {
      setTimeout(() => setLabel("Open Folder"), 2000);
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

// ── StatusLine ────────────────────────────────────────────────────────────────

function StatusLine({ item }) {
  const [openState, setOpenState] = useState("idle");
  // "idle" | "opening" | "error"

  async function handleOpenFolder() {
    setOpenState("opening");
    try {
      await openFolder(item.filePath);
      setOpenState("idle");
    } catch {
      setOpenState("error");
      setTimeout(() => setOpenState("idle"), 3000);
    }
  }

  switch (item.status) {
    case "queued":
      return <Badge label="Queued" color="default" />;

    case "downloading":
      return (
        <ProgressBar
          percent={item.progress}
          speed={item.speed}
          eta={item.eta}
          filesize={item.filesize}
          stage="downloading"
        />
      );

    case "merging":
      return <ProgressBar stage="merging" />;

    case "done":
      return (
        <div className="queue-status-done-row">
          <Badge label="✓ Saved" color="green" />
          {item.filePath && (
            <button
              className="open-folder-btn"
              onClick={handleOpenFolder}
              disabled={openState === "opening"}
            >
              {openState === "opening" ? "Opening…" : "📁 Open Folder"}
            </button>
          )}
          {openState === "error" && (
            <span className="queue-open-error">Could not open</span>
          )}
        </div>
      );

    case "error":
      return (
        <span className="queue-status-error" title={item.error || ""}>
          {item.error || "Download failed"}
        </span>
      );

    default:
      return null;
  }
}

// ── QueueItem ─────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   item: import("../../types/shapes.js").QueueItem,
 *   onRemove: (id: string) => void
 * }} props
 */
export default function QueueItem({ item, onRemove }) {
  const isActive = item.status === "downloading" || item.status === "merging";

  /* Format badge text: social modes show "Social", audio shows format,
     video shows format */
  const formatBadge = isSocialMode(item.mode)
    ? "Social"
    : item.mode === MODES.AUDIO
      ? item.audioFormat?.toUpperCase()
      : item.videoFormat?.toUpperCase();

  return (
    <div className="queue-item">
      {/* Thumbnail */}
      {item.thumbnail ? (
        <img
          className="queue-thumb"
          src={item.thumbnail}
          alt=""
          loading="lazy"
          width={40}
          height={40}
        />
      ) : (
        <div className="queue-thumb queue-thumb-placeholder" />
      )}

      {/* Meta */}
      <div className="queue-item-meta">
        <div className="queue-item-title-row">
          <span className="queue-item-title">{item.title}</span>
          {item.mode === MODES.VIDEO && item.quality && (
            <Badge label={`${item.quality}p`} color="default" />
          )}
          {formatBadge && <Badge label={formatBadge} color="accent" />}
        </div>
        <div className="queue-item-status">
          <StatusLine item={item} />
        </div>
      </div>

      {/* Remove */}
      <button
        className="queue-remove-btn"
        onClick={() => onRemove(item.id)}
        disabled={isActive}
        title="Remove from queue"
        aria-label="Remove from queue"
      >
        ×
      </button>
    </div>
  );
}
