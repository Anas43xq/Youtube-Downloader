// --- FILE: frontend/src/components/history/HistoryItem.jsx ---

import { useState, useEffect } from "react";
import Badge from "../common/Badge.jsx";
import { relativeTime, UPDATE_INTERVAL } from "../../utils/relativeTime.js";
import { MODES, isSocialMode } from "../../constants/modes.js";

/**
 * Individual download history entry.
 *
 * @param {{
 *   item: import("../../types/shapes.js").HistoryItem,
 *   onRemove: (id: string) => void,
 *   onReDownload: (item: import("../../types/shapes.js").HistoryItem) => void
 * }} props
 */
export default function HistoryItem({ item, onRemove, onReDownload }) {
  // Tick every 60 s so relative timestamps stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), UPDATE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const formatBadge = isSocialMode(item.mode)
    ? "Social"
    : item.mode === MODES.AUDIO
      ? item.audioFormat?.toUpperCase()
      : item.videoFormat?.toUpperCase();

  return (
    <div className="history-item">
      {/* Left: meta */}
      <div className="history-item-meta">
        <div className="queue-item-title-row">
          <span className="history-title">{item.title}</span>
          {item.mode === MODES.VIDEO && item.quality && (
            <Badge label={`${item.quality}p`} color="default" />
          )}
          {formatBadge && <Badge label={formatBadge} color="default" />}
        </div>
        {item.filename && (
          <div className="history-filename">{item.filename}</div>
        )}
      </div>

      {/* Right: time + filesize + actions */}
      <div className="history-right">
        <span className="history-time">{relativeTime(item.downloadedAt)}</span>
        {item.filesize && (
          <span className="history-time" style={{ textAlign: "right" }}>
            {item.filesize}
          </span>
        )}
        <div className="history-actions">
          <button
            className="redownload-btn"
            onClick={() => onReDownload(item)}
            title="Add to queue again"
          >
            ↓ Again
          </button>
          <button
            className="redownload-btn history-remove-btn"
            onClick={() => onRemove(item.id)}
            title="Remove from history"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
