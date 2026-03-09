// --- FILE: frontend/src/components/history/HistoryPanel.jsx ---

import { useState } from "react";
import HistoryItem from "./HistoryItem.jsx";

/**
 * Collapsible download history panel.
 * Collapsed by default; renders null when empty and collapsed.
 *
 * @param {{
 *   history: import("../../types/shapes.js").HistoryItem[],
 *   onRemove: (id: string) => void,
 *   onClear: () => void,
 *   onReDownload: (item: import("../../types/shapes.js").HistoryItem) => void
 * }} props
 */
export default function HistoryPanel({ history, onRemove, onClear, onReDownload }) {
  const [collapsed, setCollapsed] = useState(true);

  // When empty and collapsed, render nothing
  if (history.length === 0 && collapsed) return null;

  function handleClear(e) {
    e.stopPropagation();
    if (window.confirm("Clear all download history?")) onClear();
  }

  return (
    <div className="history-panel">
      {/* Header — click anywhere to collapse/expand */}
      <div
        className="history-header"
        role="button"
        tabIndex={0}
        onClick={() => setCollapsed((c) => !c)}
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
            <button className="queue-btn-secondary" onClick={handleClear}>
              Clear All
            </button>
          )}
          <span className="history-chevron" aria-hidden="true">
            {collapsed ? "▼" : "▲"}
          </span>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">No downloads yet</div>
          ) : (
            history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onRemove={onRemove}
                onReDownload={onReDownload}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
