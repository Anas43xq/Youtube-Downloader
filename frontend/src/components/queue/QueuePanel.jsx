// --- FILE: frontend/src/components/queue/QueuePanel.jsx ---

import QueueItem from "./QueueItem.jsx";
import Spinner from "../common/Spinner.jsx";

/**
 * @param {{
 *   items: import("../../types/shapes.js").QueueItem[],
 *   isRunning: boolean,
 *   onRemove: (id: string) => void,
 *   onClearDone: () => void,
 *   onDownloadAll: () => void
 * }} props
 */
export default function QueuePanel({ items, isRunning, onRemove, onClearDone, onDownloadAll }) {
  if (items.length === 0) return null;

  const doneCount   = items.filter((i) => i.status === "done").length;
  const queuedCount = items.filter((i) => i.status === "queued").length;

  return (
    <div className="queue-panel">
      {/* Header */}
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
                <Spinner size={12} />
                Downloading…
              </>
            ) : (
              "Download All"
            )}
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="queue-list">
        {items.map((item) => (
          <QueueItem key={item.id} item={item} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
